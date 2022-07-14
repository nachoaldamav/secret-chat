import { CheckCircleIcon, PencilIcon } from "@heroicons/react/outline";
import {
  Conversation,
  Participant as TwilioParticipant,
} from "@twilio/conversations";
import { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useTwilio from "../hooks/twilio";
import { nhost } from "../libs/nhost";
import { Room } from "../pages/chat/[room]";
import { Participant } from "../types/Room";

export default function RoomInfo({
  room,
  roomData,
  participants,
  onClick,
  isCreator,
}: {
  room: string;
  roomData: Room;
  participants: Participant[];
  onClick: () => void;
  isCreator: boolean;
}) {
  const router = useRouter();
  const { client } = useTwilio();
  const [conversation, setConversation] = useState<Conversation | null>();
  const [users, setUsers] = useState<TwilioParticipant[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(roomData.name);
  const [icon, setIcon] = useState<File | null>(null);

  async function handleUserUpdate(user: TwilioParticipant) {
    const userdata = await user.getUser();
    if (userdata) {
      const isOnline = userdata.isOnline;
      if (isOnline) {
        setOnlineUsers((onlineUsers) => [
          ...onlineUsers,
          user.identity as string,
        ]);
      }
    }
  }

  useEffect(() => {
    if (client) {
      client.getConversationByUniqueName(room).then((conversation) => {
        setConversation(conversation);
      });
    }
  }, [client, room]);

  useEffect(() => {
    if (conversation) {
      conversation.getParticipants().then((participants) => {
        setUsers(participants);
        participants.forEach((participant) => {
          handleUserUpdate(participant);
        });
      });
    }
  }, [conversation]);

  useEffect(() => {
    if (users) {
      users.forEach((user) => {
        user.on("updated", (event) => {
          handleUserUpdate(event.participant);
        });
      });

      return () => {
        users.forEach((user) => {
          user.off("updated", (event) => {
            handleUserUpdate(event.participant);
          });
        });
      };
    }
  }, [users]);

  useEffect(() => {
    async function updateRoom() {
      // Upload new icon to bucket
      const iconId =
        icon !== null
          ? await nhost.storage
              .upload({ file: icon as File })
              .then((result) => result.fileMetadata?.id)
          : null;

      const iconUrl = iconId
        ? nhost.storage.getPublicUrl({
            fileId: iconId as string,
          })
        : roomData.icon;

      await nhost.graphql.request(QUERY, {
        id: roomData.id,
        name: name || roomData.name,
        icon: iconUrl || roomData.icon,
      });

      // Update room in cache
      router.reload();
    }

    if ((name !== roomData.name || icon !== null) && !editMode) {
      updateRoom();
    }
  }, [name, icon, roomData, editMode, router]);

  return (
    <span className="absolute inset-0 w-full h-full bg-black bg-opacity-40 rounded-xl z-[9999]">
      <span
        className="absolute inset-0 w-full h-full cursor-pointer z-[9999]"
        onClick={onClick}
      />
      <div className="absolute inset-0 my-10 mx-auto p-4 z-[99999] rounded-xl w-3/4 h-3/4 bg-primary">
        {isCreator && (
          <button
            className="absolute top-0 right-0 m-2 border-2 rounded p-1.5 bg-transparent hover:bg-white hover:text-secondary transition duration-150"
            onClick={() => setEditMode(!editMode)}
          >
            {!editMode ? (
              <PencilIcon className="h-5 w-5" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
          </button>
        )}
        {!editMode ? (
          <img
            className="rounded-full h-32 w-32 mx-auto mb-2"
            src={roomData.icon || "https://via.placeholder.com/150"}
            alt={roomData.name}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 w-full mb-2">
            <input
              className="hidden"
              id="icon-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIcon(file);
                }
              }}
            />
            <div
              className="h-full w-32 rounded-full border-dotted border-2 border-gray-300 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => {
                const input = document.getElementById(
                  "icon-input"
                ) as HTMLInputElement;
                input.click();
              }}
            >
              <span className="text-center">Seleccionar imagen</span>
            </div>
          </div>
        )}

        {!editMode ? (
          <h2 className="text-white text-xl text-center mb-2">
            {roomData.name || "Sin definir"}
          </h2>
        ) : (
          <input
            className="w-full mb-2 bg-transparent text-white border-gray-600 border rounded-lg px-2 h-9"
            value={name}
            placeholder="Nombre de la sala"
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-1">
          {participants.map((participant, index) => (
            <div className="flex items-center justify-between" key={index}>
              <div className="flex items-center w-full relative">
                {onlineUsers.includes(participant.id) && (
                  <span className="absolute bottom-0 left-6 h-3 w-3 rounded-full bg-green-500 z-[99999]"></span>
                )}
                <img
                  className="h-8 w-8 rounded-full"
                  src={participant.avatar}
                  alt={participant.name}
                />
                <span className="ml-2">{participant.name}</span>
                {participant.isCreator && (
                  <span className="w-full text-right font-bold">Creador</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </span>
  );
}

const QUERY = gql`
  mutation UpdateRoomInfo(
    $id: uuid = id
    $icon: String = icon
    $name: String = name
  ) {
    update_room(
      where: { id: { _eq: $id } }
      _set: { name: $name, icon: $icon }
    ) {
      affected_rows
    }
  }
`;
