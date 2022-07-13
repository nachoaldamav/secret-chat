import { gql } from "@apollo/client";
import { Client, Conversation, Message } from "@twilio/conversations";
import { nhost } from "../libs/nhost";

export default function getHomeMessages(
  id: string,
  accessToken: string
): Promise<HomeMessage> {
  if (!accessToken) {
    throw new Error("No access token");
  }

  const client = new Client(accessToken);

  return new Promise((resolve) => {
    client.on("stateChanged", async (state) => {
      if (state === "initialized") {
        try {
          const conversation: Conversation =
            await client.getConversationByUniqueName(id);
          const unread = (await conversation.getUnreadMessagesCount()) || 0;
          const messages = await conversation.getMessages(1);
          const author = await getName(
            (messages.items[0].author as string) || ""
          );
          const timestamp = messages.items[0].dateCreated?.toISOString() || "";
          resolve({ unread, message: messages.items[0], author, timestamp });
        } catch (e) {
          console.error("Joining room failed: ", e);
        }
      }
    });
  });
}

export type HomeMessage = {
  unread: number;
  message: Message;
  author: string;
  timestamp: string;
};

export async function getName(id: string): Promise<string> {
  const QUERY = gql`
    query getName($id: uuid = id) {
      user(id: $id) {
        displayName
      }
    }
  `;

  const res = await nhost.graphql.request(QUERY, { id });
  return res.data?.user?.displayName || "";
}
