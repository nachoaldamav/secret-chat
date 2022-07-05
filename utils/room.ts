import { Client, Conversation } from "@twilio/conversations";
import type { Participant } from "../types/Room";
import addParticipant from "../queries/addParticipants";
import getUserId from "../queries/getUserId";

export default async function createOrJoinRoom(
  room: string,
  accessToken: string,
  participants: Participant[] | null = null,
  isCreator: boolean = false
): Promise<Conversation> {
  const userId = getUserId();
  const client = new Client(accessToken);

  return new Promise((resolve) => {
    client.on("stateChanged", async (state) => {
      if (state === "initialized") {
        let conversation: Conversation;

        try {
          if (!isCreator) throw new Error("You are not the creator");
          conversation = await client.createConversation({ uniqueName: room });
          conversation.add(userId as string);

          if (participants) {
            for (const participant of participants) {
              await addParticipant({
                room,
                participant: participant.id,
              });
              await conversation?.add(participant.id);
            }
          }
          resolve(conversation);
        } catch (e) {
          try {
            conversation = await client.getConversationByUniqueName(room);
            resolve(conversation);
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  });
}

const ERROR_CODES = {
  not_creator: "User is not the creator of the room, trying to join...",
};

type Props = {
  room: string;
  accessToken: string;
  participants?: Participant[] | null;
  isCreator?: boolean;
};
