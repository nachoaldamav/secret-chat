import { nhost } from "../libs/nhost";
import { gql } from "@apollo/client";

export default async function addParticipant(
  room: string,
  participant: string
) {
  const { data, error } = await nhost.graphql.request(
    gql`
      mutation addParticipant(
        $room_id: uuid = room_id
        $user_id: uuid = user_id
      ) {
        insert_chat(objects: { user_id: $user_id, room_id: $room_id }) {
          affected_rows
        }
      }
    `,
    {
      room_id: room,
      user_id: participant,
    }
  );

  if (error) {
    console.log(error);
    return { data: null, error };
  }

  return { data, error: null };
}
