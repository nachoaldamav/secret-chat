import { ApolloError, gql } from "@apollo/client";
import { PaperAirplaneIcon } from "@heroicons/react/outline";
import { useAuthQuery } from "@nhost/react-apollo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import getUserId from "../../queries/getUserId";

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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreator, setIsCreator] = useState(false);

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
      }
    }
  }, [data, userId]);

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

  console.log(data);
  console.log("Participants: ", participants);

  return (
    <div className="w-full pb-10 h-full flex flex-col justify-center items-center">
      <section id="messages" className="h-5/6 w-full"></section>
      <section
        id="input"
        className="w-full inline-flex items-start justify-between gap-1"
      >
        <input
          type="text"
          className="w-full rounded-xl bg-transparent"
          placeholder="Type a message..."
        />
        <button
          className="w-fit h-full rounded-xl bg-blue-600 inline-flex items-center text-white pl-2 pr-2 justify-center"
          type="button"
          onClick={() => {
            console.log("Send message");
          }}
        >
          <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
        </button>
      </section>
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

type Participant = {
  avatar: string;
  lastSeen: string;
  name: string;
  id: string;
  isCreator: boolean;
};
