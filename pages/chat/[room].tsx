import { ApolloError, gql } from "@apollo/client";
import { PaperAirplaneIcon } from "@heroicons/react/outline";
import { useAuthQuery } from "@nhost/react-apollo";
import type { Participant } from "../../types/Room";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Spinner from "../../components/Spinner";
import { useTwilioConfig } from "../../hooks/useTwilioConfig";
import getUserId from "../../queries/getUserId";
import createOrJoinRoom from "../../utils/room";
import { Conversation, Message } from "@twilio/conversations";

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
  let scrollDiv = useRef(null);
  const { config } = useTwilioConfig();
  const { accessToken } = config;

  const { loading, data, error }: QUERY_PROPS = useAuthQuery(GET_ROOM, {
    variables: { roomId: room },
  });

  const handleMessageAdded = (message: Message) => {
    setMessages((messages) => [...messages, message]);
    scrollToBottom();
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
    async function joinRoom() {
      const conversation = await createOrJoinRoom(
        roomId,
        accessToken as string,
        participants,
        isCreator as boolean
      );

      setConversation(conversation);
      const messages = await conversation.getMessages();
      setMessages(messages.items);

      scrollToBottom();

      conversation.on("messageAdded", (message: Message) =>
        handleMessageAdded(message)
      );
    }

    if (accessToken && room) joinRoom();

    return () => {
      conversation?.off("messageAdded", handleMessageAdded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, room]);

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

  function scrollToBottom() {
    // @ts-ignore-next-line
    const current = scrollDiv.current as HTMLElement;

    setTimeout(() => {
      if (current) {
        current.scrollTop = current.scrollHeight - 100;
      } else {
        console.log("No scrollDiv");
      }
    }, 0);
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 justify-start items-center">
      <section
        id="messages"
        className="h-full w-full flex flex-col overflow-x-auto gap-4 p-2"
        ref={scrollDiv}
      >
        {messages
          .filter((message, index) => {
            return messages.findIndex((m) => m.sid === message.sid) === index;
          })
          .map((message) => (
            <div key={message.sid} className="flex w-full">
              <div
                className="flex flex-col w-full"
                style={{
                  textAlign: message.author === userId ? "right" : "left",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: message.author === userId ? "green" : "white",
                  }}
                >
                  {participants.find((p) => p.id === message.author)?.name}
                </p>
                <p className="text-sm">{message.body}</p>
              </div>
            </div>
          ))}
      </section>
      <form
        id="input"
        className="w-full mb-2 inline-flex items-start justify-between gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const message = document.getElementById(
            "message"
          ) as HTMLInputElement;
          sendMessage(message.value);
          message.value = "";
        }}
      >
        <input
          type="text"
          id="message"
          className="w-full rounded-xl bg-transparent"
          placeholder="Type a message..."
        />
        <button
          className="w-fit h-full rounded-xl bg-blue-600 inline-flex items-center text-white pl-2 pr-2 justify-center"
          type="submit"
        >
          <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
        </button>
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
