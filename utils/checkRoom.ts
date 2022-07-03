import { nhost } from "../libs/nhost";
import { gql } from "@apollo/client";
import getUserId from "../queries/getUserId";

export default async function checkRoom(room: string) {
  const userId = getUserId();

  if (!userId) return null;

  const { data, error } = await nhost.graphql.request(
    gql`
      query checkRoom($userId: uuid = userId, $roomId: uuid = room) {
        room(where: { creator_id: { _eq: $userId }, id: { _eq: $roomId } }) {
          id
        }
      }
    `,
    {
      userId,
      room,
    }
  );

  if (error) {
    console.log(error);
    return false;
  } else if (data.room.length === 0) {
    return false;
  }

  return true;
}
