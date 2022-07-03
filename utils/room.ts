import { Client } from "@twilio/conversations";
import addParticipant from "../queries/addParticipants";

export default async function createOrJoinRoom({
  room,
  accessToken,
  participants,
}: Props) {
  const client = new Client(accessToken);

  return new Promise((resolve) => {
    client.on("stateChanged", async (state) => {
      if (state === "initialized") {
        let conversation;

        try {
          conversation = await client.createConversation({ uniqueName: room });

          if (participants) {
            for (const participant of participants) {
              await addParticipant({ room, participant });
              await conversation?.add(participant);
            }
          }
        } catch (e) {
          console.error(e);

          try {
            conversation = await client.getConversationByUniqueName(room);
          } catch (e) {
            console.error(e);
          }
        }

        console.log(conversation);

        resolve(conversation);
      }
    });
  });
}

type Props = {
  room: string;
  accessToken: string;
  participants?: string[];
};
