import { PencilIcon } from "@heroicons/react/outline";
import {
  Conversation,
  Participant as TwilioParticipant,
} from "@twilio/conversations";
import { useEffect, useState } from "react";
import useTwilio from "../hooks/twilio";
import { Room } from "../pages/chat/[room]";
import { Participant } from "../types/Room";

export default function RoomInfo({
  room,
  roomData,
  participants,
  onClick,
}: {
  room: string;
  roomData: Room;
  participants: Participant[];
  onClick: () => void;
}) {
  const { client } = useTwilio();
  const [conversation, setConversation] = useState<Conversation | null>();
  const [users, setUsers] = useState<TwilioParticipant[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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

  return (
    <span className="absolute inset-0 w-full h-full bg-black bg-opacity-40 rounded-xl z-[9999]">
      <span
        className="absolute inset-0 w-full h-full cursor-pointer z-[9999]"
        onClick={onClick}
      />
      <div className="absolute inset-0 my-10 mx-auto p-4 z-[99999] rounded-xl w-3/4 h-3/4 bg-primary">
        <button className="absolute top-0 right-0 m-2 border-2 rounded p-1.5 bg-transparent hover:bg-white hover:text-secondary transition duration-150">
          <PencilIcon className="h-4 w-4" />
        </button>
        <img
          className="rounded-full h-32 w-32 mx-auto mb-2"
          src={roomData.icon || "https://via.placeholder.com/150"}
          alt={roomData.name}
        />
        <h2 className="text-white text-xl text-center">
          {roomData.name || "Sin definir"}
        </h2>
        <div className="flex flex-col gap-2 overflow-y-auto">
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
