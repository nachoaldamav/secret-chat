import { gql } from "@apollo/client";
import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/outline";
import { Conversation } from "@twilio/conversations";
import { useEffect, useState } from "react";
import { nhost } from "../libs/nhost";
import addParticipant from "../queries/addParticipants";
import { Participant } from "../types/Room";

const QUERY_PARTICIPANTS = gql`
  query getUsers($_like: String = _like) {
    users(where: { displayName: { _like: $_like } }) {
      id
      displayName
      avatarUrl
      user_data {
        custom_avatar
      }
    }
  }
`;

export default function AddNewParticipant({
  conversation,
  room,
  participants,
  setParticipants,
}: Props) {
  const [name, setName] = useState("");
  const [options, setOptions] = useState<User[] | null>(null);

  useEffect(() => {
    if (name !== "") {
      nhost.graphql
        .request(QUERY_PARTICIPANTS, { _like: name })
        .then(({ data }) => {
          console.log(data);
          setOptions(data.users);
        })
        .catch(console.error);
    }
  }, [name]);

  async function handleSubmit(user: User) {
    await addParticipant(room, user.id);
    await conversation.add(user.id);
    setParticipants([
      ...participants,
      {
        id: user.id,
        name: user.displayName,
        avatar: user.avatarUrl || user.user_data.custom_avatar,
        isCreator: false,
        lastSeen: new Date().toDateString(),
      },
    ]);
  }

  function checkParticipant(id: string) {
    return participants.some((participant) => participant.id === id);
  }

  return (
    <div className="absolute inset-0 my-10 mx-auto px-4 py-2 gap-2 z-[99999] flex flex-col justify-start items-start rounded-xl w-3/4 h-3/4 bg-primary">
      <h3 className="text-xl font-bold">Añadir participante</h3>
      <input
        className="w-full p-2 rounded-xl bg-transparent"
        type="text"
        placeholder="Nombre..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {name !== "" && options && options.length > 0 ? (
        options.map((user) => (
          <div
            className="w-full inline-flex justify-between items-center"
            key={user.id}
          >
            <span className="text-xl">{user.displayName}</span>
            <button
              className="inline-flex"
              onClick={() => {
                if (!checkParticipant(user.id)) {
                  handleSubmit(user);
                }
              }}
            >
              {checkParticipant(user.id) ? (
                <CheckCircleIcon className="h-8 w-8" />
              ) : (
                <PlusCircleIcon className="h-8 w-8" />
              )}
            </button>
          </div>
        ))
      ) : (
        <h3 className="font-medium text-center w-full">
          No se encontraron resultados
        </h3>
      )}
    </div>
  );
}

type Props = {
  conversation: Conversation;
  room: string;
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
};

type User = {
  id: string;
  displayName: string;
  avatarUrl: string;
  user_data: {
    custom_avatar: string;
  };
};
