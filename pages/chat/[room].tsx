import { ApolloError, gql } from "@apollo/client";
import { PaperAirplaneIcon } from "@heroicons/react/outline";
import { useAuthQuery } from "@nhost/react-apollo";
import type { Participant } from "../../types/Room";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { useTwilioConfig } from "../../hooks/useTwilioConfig";
import getUserId from "../../queries/getUserId";
import createOrJoinRoom from "../../utils/room";
import { Conversation } from "@twilio/conversations";

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

export default function RoomPage() {
  const router = useRouter();
  const userId = getUserId();
  const { room } = router.query;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const { config } = useTwilioConfig();
  const { accessToken } = config;

  const {
    loading,
    data,
    error,
  }: {
    loading: boolean;
    data?: RoomData;
    error?: ApolloError;
  } = useAuthQuery(GET_ROOM, {
    variables: { roomId: room },
  });

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
        console.log("Not creator");
        console.log(data.room[0].creator_id);
        console.log(userId);
      }
    }
  }, [data, userId]);

  useEffect(() => {
    const roomId = room as string;
    async function joinRoom() {
      console.log("Joining room");
      const conversation = await createOrJoinRoom(
        roomId,
        accessToken as string,
        participants,
        isCreator as boolean
      );
      setConversation(conversation);
      console.log(conversation);
    }

    if (accessToken && room) joinRoom();
  }, [participants, isCreator, accessToken, room]);

  useEffect(() => {
    if (conversation) {
      conversation.on("messageAdded", (message) => {
        console.log(message);
      });
    }
  }, [conversation]);

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
      conversation
        .sendMessage(message)
        .then((e) => {
          console.log("Message sent", e);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("No conversation");
    }
  }

  return (
    <div className="w-full pb-10 h-full flex flex-col justify-center items-center">
      <section id="messages" className="h-5/6 w-full"></section>
      <form
        id="input"
        className="w-full inline-flex items-start justify-between gap-1"
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
