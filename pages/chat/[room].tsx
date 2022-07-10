import { ApolloError, gql } from "@apollo/client";
import {
  ArrowDownIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  TrashIcon,
  UploadIcon,
} from "@heroicons/react/outline";
import { useAuthQuery } from "@nhost/react-apollo";
import type { Participant } from "../../types/Room";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Spinner from "../../components/Spinner";
import { useTwilioConfig } from "../../hooks/useTwilioConfig";
import getUserId from "../../queries/getUserId";
import { Conversation, Message } from "@twilio/conversations";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import ChatSkeleton from "../../components/chatLoader";
import MessageComponent from "../../components/Message";
import scrollToBottom from "../../utils/scrollToBottom";
import joinRoom from "../../utils/joinRoom";
import useScroll from "../../hooks/useScroll";

const GET_ROOM = gql`
  query getRoom($roomId: uuid! = room) {
    room(where: { id: { _eq: $roomId } }) {
      creator_id
      created_at
      icon
      id
      chats {
        user_data {
          id
          custom_avatar
          last_seen
          user {
            avatarUrl
            displayName
          }
        }
      }
    }
  }
`;

type QUERY_PROPS = {
  loading: boolean;
  error?: ApolloError | null;
  data?: RoomData;
};

function manualScroll() {
  const el = document.getElementById("messages");
  if (el) {
    el.scrollTop = el.scrollHeight - el.offsetHeight + 100;
  }
}

export default function RoomPage() {
  const router = useRouter();
  const userId = getUserId();
  const { room } = router.query;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [media, setMedia] = useState<File[] | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { scroll, setScroll } = useScroll();
  let scrollDiv = useRef(null);
  const { config } = useTwilioConfig();
  const { accessToken } = config;

  const { loading, data, error }: QUERY_PROPS = useAuthQuery(GET_ROOM, {
    variables: { roomId: room },
  });

  const handleMessageAdded = (message: Message) => {
    setMessages((messages) => [...messages, message]);

    if (!scroll) {
      scrollToBottom(scrollDiv);
      conversation?.setAllMessagesRead();
    }
  };

  useEffect(() => {
    if (data && data.room) {
      data?.room[0].chats?.forEach((participant) => {
        const user = participant.user_data;
        if (user) {
          const avatar = user?.custom_avatar || user.user.avatarUrl;
          const lastSeen = user.last_seen;
          const name = user.user.displayName;
          const id = user.id;
          const isCreator = id === data.room[0].creator_id;

          setParticipants((prevParticipants) => [
            ...prevParticipants,
            { avatar, lastSeen, name, id, isCreator },
          ]);
        }
      });

      if (userId === data.room[0].creator_id) {
        setIsCreator(true);
      } else {
        setIsCreator(false);
      }
    }
  }, [data, userId]);

  useEffect(() => {
    const roomId = room as string;

    if (userId && accessToken && room)
      joinRoom(
        roomId,
        accessToken,
        participants,
        isCreator as boolean,
        setConversation,
        setMessages,
        scrollDiv,
        handleMessageAdded
      );

    return () => {
      conversation?.off("messageAdded", handleMessageAdded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, room, userId]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <p>{error.message}</p>
      </div>
    );
  }

  if (data && data.room.length === 0) router.push("/home");

  function sendMessage(message: string) {
    if (conversation) {
      if (message !== "")
        conversation.sendMessage(String(message).trim()).catch((err: any) => {
          console.log(err);
        });
      if (media) {
        media.forEach((file) => {
          const formData = new FormData();
          formData.append("file", file);
          conversation.sendMessage(formData).then(() => {
            // Remove the file from the state after sending
            // @ts-ignore-next-line
            setMedia((prevMedia) => prevMedia?.filter((m) => m !== file));
          });
        });
      }
    } else {
      console.log("No conversation");
    }
  }

  function recordAudio() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      setAudioRecorder(recorder);
      const chunks: Blob[] = [];

      recorder.start(1000);

      recorder.ondataavailable = (e) => {
        console.log("Chunk added!");
        setAudioChunks((prevChunks) => [...prevChunks, e.data]);
      };
    });
  }

  function stopAudio() {
    if (audioRecorder) {
      audioRecorder.stop();
      setRecording(false);
    }
  }

  function sendAudio() {
    if (audioRecorder && conversation) {
      stopAudio();
      const blob = new Blob(audioChunks, {
        type: "audio/wav",
      });

      const formData = new FormData();
      formData.append("file", blob as Blob, "audio.wav");

      conversation
        .sendMessage(formData)
        .then(() => {
          cleanAudio();
        })
        .catch((err: any) => {
          console.log(err);
          cleanAudio();
        });
    }
  }

  function cleanAudio() {
    setAudioChunks([]);
  }

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      <div className="w-full h-14 p-2 flex flex-row justify-between items-center">
        <Link as={"/home"} href="/home">
          <a className="h-6 w-6">
            <ArrowLeftIcon />
          </a>
        </Link>
      </div>
      {scroll && (
        <button
          className="absolute bottom-24 inline-flex gap-2 right-0 mx-auto w-fit px-4 py-2 rounded-xl left-0 z-[99999] bg-gray-700"
          onClick={() => manualScroll()}
        >
          <ArrowDownIcon className="h-6 w-6" /> Volver al inicio
        </button>
      )}
      <section
        id="messages"
        className="h-[80%] relative md:h-[80%] w-full flex flex-col overflow-y-auto overflow-x-hidden gap-4 p-2 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-gray-800"
        ref={scrollDiv}
      >
        {messages.length === 0 && (
          <ChatSkeleton
            speed={2}
            backgroundColor="#13111c"
            foregroundColor="#181622"
          />
        )}
        {messages
          .filter((message, index) => {
            return messages.findIndex((m) => m.sid === message.sid) === index;
          })
          .map((message: Message) => (
            <MessageComponent
              key={message.sid}
              message={message}
              participants={participants}
            />
          ))}
      </section>
      <form
        id="input"
        autoComplete="off"
        className="w-full z-20 inline-flex items-center justify-between gap-1 flex-row absolute bottom-0 left-0 px-2 py-6 bg-gray-100 dark:bg-primary rounded-none md:rounded-b-xl h-22"
        onSubmit={(e) => {
          e.preventDefault();

          // @ts-ignore-next-line
          const input = e.target.elements.message as HTMLInputElement;

          if (message || media) {
            sendMessage((message as string) || "");
            setMessage(null);
            input.value = "";
          }
        }}
      >
        <input
          autoComplete="false"
          name="hidden"
          type="text"
          className="hidden"
        />
        {!recording ? (
          <>
            <input
              type="text"
              id="message"
              className="w-full rounded-xl bg-transparent"
              placeholder={
                !media
                  ? "Escribe un mensaje"
                  : (media && media[0]?.name) || "Archivo elegido..."
              }
              onChange={(e) => {
                setMessage(e.target.value);
                conversation?.typing();
              }}
              onTouchEnd={() => {
                if (!scroll) {
                  manualScroll();
                }
              }}
            />
            <input
              type="file"
              className="hidden"
              id="file-selector"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // @ts-ignore-next-line
                  if (media) setMedia((prevMedia) => [...prevMedia, file]);
                  else setMedia([file]);
                }
              }}
            />
            <button
              className="w-12 h-12 flex items-center justify-center"
              onClick={() => {
                const fileSelector = document.getElementById(
                  "file-selector"
                ) as HTMLInputElement;
                fileSelector.click();
              }}
            >
              <UploadIcon className="h-6 w-6" />
            </button>
          </>
        ) : (
          <span className="font-bold text-center w-full text-xl">
            Grabando audio...
          </span>
        )}
        {message || media ? (
          <button
            className="w-fit h-full rounded-xl py-2 bg-blue-600 inline-flex items-center text-white pl-2 pr-2 justify-center"
            type="submit"
          >
            <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
          </button>
        ) : (
          <>
            <button
              className={
                !recording
                  ? "w-fit h-full rounded-xl py-2 bg-blue-600 inline-flex items-center text-white pl-2 pr-2 justify-center"
                  : "w-fit h-full rounded-xl py-2 bg-red-600 inline-flex items-center text-white pl-2 pr-2 justify-center"
              }
              type="button"
              onClick={() => {
                if (!recording) {
                  recordAudio();
                  setRecording(true);
                } else {
                  stopAudio();
                  setRecording(false);
                  cleanAudio();
                }
              }}
            >
              {!recording ? (
                <MicrophoneIcon className="w-6 h-6" />
              ) : (
                <TrashIcon className="w-6 h-6" />
              )}
            </button>
            {recording && (
              <button
                className="w-fit h-full rounded-xl py-2 bg-blue-600 inline-flex items-center text-white pl-2 pr-2 justify-center"
                type="button"
                onClick={() => {
                  sendAudio();
                }}
              >
                <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}

interface RoomData {
  room: Room[];
}

type Room = {
  creator_id: string;
  created_at: string;
  icon: string;
  id: string;
  chats: ChatData[];
};

type ChatData = {
  user_data: {
    id: string;
    custom_avatar: string;
    last_seen: string;
    user: {
      avatarUrl: string;
      displayName: string;
    };
  };
};
