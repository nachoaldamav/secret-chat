import { ApolloError, gql } from "@apollo/client";
import {
  ArrowDownIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PlusIcon,
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
import checkSafeImage from "../../utils/checkSafeImage";
import Image from "next/image";
import AddNewParticipant from "../../components/AddNewParticipant";
import InfiniteScroll from "../../components/InfiniteScroll";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [media, setMedia] = useState<File[] | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [addParticipant, setAddParticipant] = useState<boolean>(false);
  const { scroll, setContainer } = useScroll();
  let scrollDiv = useRef(null);
  const { config } = useTwilioConfig();
  const { accessToken } = config;

  const { loading, data, error }: QUERY_PROPS = useAuthQuery(GET_ROOM, {
    variables: { roomId: room },
  });

  const handleMessageAdded = (message: Message) => {
    setMessages((messages) => [...messages, message]);
    setMessagesCount((messagesCount) => messagesCount + 1);
    if (!scroll) {
      console.log("Scrolling to bottom");
      scrollToBottom(scrollDiv);
    } else {
      console.log("Not scrolling to bottom");
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
        handleMessageAdded,
        setMessagesCount
      );

    setContainer(document.getElementById("messages") as HTMLDivElement);

    return () => {
      conversation?.off("messageAdded", handleMessageAdded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, room, userId]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <p>{error.message}</p>
      </div>
    );
  }

  if (data && data.room.length === 0) router.push("/home");

  async function sendMessage(message: string) {
    setSending(true);
    if (conversation) {
      if (message !== "")
        conversation.sendMessage(String(message).trim()).catch((err: any) => {
          console.log(err);
        });
      if (media) {
        await Promise.all(
          media.map(async (file) => {
            const ext = file.name.split(".").pop();
            const basename = file.name.split(".").shift();
            const isSafe =
              ext === "jpg" || ext === "png" || ext === "webp"
                ? await checkSafeImage(file)
                : true;
            const filename = `${basename}${!isSafe ? "-blur" : ""}.${ext}`;
            const formData = new FormData();
            formData.append("file", file, filename);
            await conversation.sendMessage(formData);
            return filename;
          })
        );
        // Clear media
        setMedia([]);
        setSending(false);
      } else {
        setSending(false);
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

  console.log({ messagesCount, length: messages.length });

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      {loading && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <Spinner />
        </div>
      )}
      <div className="w-full h-14 p-2 flex flex-row justify-start gap-2 items-center">
        <Link as={"/home"} href="/home">
          <a className="h-6 w-6">
            <ArrowLeftIcon />
          </a>
        </Link>
        <div className="flex flex-row gap-2 justify-center w-full items-center">
          <Image
            src={
              participants.find((p) => p.isCreator)?.avatar ||
              "https://via.placeholder.com/64"
            }
            className="h-6 w-6 rounded-full"
            height={30}
            width={30}
            alt="avatar"
          />
          <div
            className="flex flex-col w-full cursor-pointer"
            onClick={() => {
              setShowInfo(true);
            }}
          >
            <h1 className="text-xl font-bold">Sala 1</h1>
            <h2 className="text-sm font-medium truncate w-80 max-w-max">
              {participants.map((p) => p.name).join(", ")}
            </h2>
          </div>
        </div>
        {isCreator && (
          <div className="flex flex-row gap-2 justify-end items-center">
            <button
              className="h-6 w-6"
              onClick={() => {
                setAddParticipant(true);
              }}
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
      {scroll && (
        <button
          className="absolute bottom-24 mb-4 inline-flex gap-2 right-0 mx-auto w-fit px-4 py-2 rounded-xl left-0 z-[9999] bg-gray-700"
          onClick={() => {
            scrollToBottom();
            conversation?.setAllMessagesRead();
          }}
        >
          <ArrowDownIcon className="h-6 w-6" /> Volver al inicio
        </button>
      )}
      {showInfo && (
        <span className="absolute inset-0 w-full h-full bg-black bg-opacity-40 rounded-xl z-[9999]">
          <span
            className="absolute inset-0 w-full h-full cursor-pointer z-[9999]"
            onClick={() => {
              setShowInfo(false);
            }}
          />
          <div className="absolute inset-0 my-10 mx-auto p-2 z-[99999] rounded-xl w-3/4 h-3/4 bg-primary">
            Hola
          </div>
        </span>
      )}
      {addParticipant && (
        <span className="absolute inset-0 w-full h-full bg-black bg-opacity-40 rounded-xl z-[9999]">
          <span
            className="absolute inset-0 w-full h-full cursor-pointer z-[9999]"
            onClick={() => {
              setAddParticipant(false);
            }}
          />
          <AddNewParticipant
            conversation={conversation as Conversation}
            room={room as string}
            participants={participants}
            setParticipants={setParticipants}
          />
        </span>
      )}
      <section
        id="messages"
        className="h-[80%] relative md:h-[80%] w-full flex flex-col overflow-y-auto overflow-x-hidden gap-4 p-2 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-gray-800"
        ref={scrollDiv}
      >
        <InfiniteScroll
          loadMore={async () => {
            if (conversation && messagesCount > messages.length) {
              const newMessages = await conversation.getMessages(
                30,
                messages.length
              );

              // Add messages on top
              setMessages((prevMessages) => [
                ...newMessages.items,
                ...prevMessages,
              ]);
              setLastMessage(newMessages.items[0]);
            }
          }}
          hasMore={messagesCount > messages.length}
          itemsLength={messages.length}
          total={messagesCount}
          lastElementIndex={lastMessage as Message}
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
                conversation={conversation as Conversation}
              />
            ))}
        </InfiniteScroll>
        <span id="scroll-anchor" />
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
              maxLength={1600}
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
                  scrollToBottom();
                }
              }}
            />
            <button
              className="w-12 h-12 flex items-center justify-center"
              id="file-button"
              type="button"
              onClick={() => {
                try {
                  const fileSelector = document.getElementById(
                    "file-selector"
                  ) as HTMLInputElement;
                  fileSelector.click();
                } catch (e) {
                  console.log(e);
                }
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
            {!sending ? (
              <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
            ) : (
              <span className="h-6 w-6 inline-flex justify-center items-center text-white">
                <svg
                  role="status"
                  className="w-6 h-6 text-inherit animate-spin dark:text-gray-600 fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </span>
            )}
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
      <input
        type="file"
        className="hidden"
        id="file-selector"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // @ts-ignore-next-line
            setMedia([file]);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

export interface RoomData {
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
