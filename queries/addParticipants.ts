import { nhost } from "../libs/nhost";
import { gql } from "@apollo/client";

export default async function addParticipant({ room, participant }: Props) {
  const { data, error } = await nhost.graphql.request(
    gql`
      mutation addParticipant(
        $room_id: uuid = room
        $user_id: uuid = participant
      ) {
        insert_chat(objects: { user_id: $user_id, room_id: $room_id }) {
          affected_rows
        }
      }
    `,
    {
      room,
      participant,
    }
  );

  if (error) {
    console.log(error);
    return { data: null, error };
  }

  return { data, error: null };
}

type Props = {
  room: string;
  participant: string;
};
