import { nhost } from "../libs/nhost";

export default async function getRoom(room: string) {
  const user = nhost.auth.getAccessToken();
  const res = await nhost.graphql.request(`
    query getRoom($roomId: uuid! = "${room}") {
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
    `);

  console.log("User", user);
  console.log("GraphQl request", res);
}
