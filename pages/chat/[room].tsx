import { ApolloError, gql } from "@apollo/client";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  TrashIcon,
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

export default function RoomPage() {
  const router = useRouter();
  const userId = getUserId();
  const { room } = router.query;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  let scrollDiv = useRef(null);
  const { config } = useTwilioConfig();
  const { accessToken } = config;

  const { loading, data, error }: QUERY_PROPS = useAuthQuery(GET_ROOM, {
    variables: { roomId: room },
  });

  const handleMessageAdded = (message: Message) => {
    setMessages((messages) => [...messages, message]);
    scrollToBottom(scrollDiv);
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
        scrollDiv
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
      conversation.sendMessage(String(message).trim()).catch((err: any) => {
        console.log(err);
      });
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
    setAudioBlob(null);
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
      <section
        id="messages"
        className="h-[80%] md:h-[90%] w-full pb-[1.5em] md:pb-[6.5em] flex flex-col overflow-y-auto overflow-x-hidden gap-4 p-2 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-gray-800"
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
        className="w-full inline-flex items-center justify-between gap-1 flex-row absolute bottom-0 left-0 px-2 py-6 bg-gray-100 dark:bg-gray-800 rounded-t-xl sm:rounded-b-xl h-22"
        onSubmit={(e) => {
          e.preventDefault();

          // @ts-ignore-next-line
          const input = e.target.elements.message as HTMLInputElement;

          if (message) {
            sendMessage(message as string);
            setMessage(null);
            input.value = "";
          }
        }}
      >
        {!recording ? (
          <input
            type="text"
            id="message"
            className="w-full rounded-xl bg-transparent"
            placeholder="Escribe tu mensaje..."
            onChange={(e) => setMessage(e.target.value)}
          />
        ) : (
          <span className="font-bold text-center w-full text-xl">
            Grabando audio...
          </span>
        )}
        {message ? (
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
