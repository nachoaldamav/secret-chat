import { Participant } from "../types/Room";
import createOrJoinRoom from "./room";

export default async function joinRoom(
  roomId: string,
  accessToken: string,
  participants: Participant[] | null = null,
  isCreator: boolean = false,
  setConversation: (conversation: any) => void,
  setMessages: (messages: any) => void,
  setMessagesCount: (count: number) => void
) {
  const conversation = await createOrJoinRoom(
    roomId,
    accessToken as string,
    participants,
    isCreator as boolean
  );

  setConversation(conversation);
  const messages = await conversation.getMessages();
  setMessages(messages.items);

  conversation.getMessagesCount().then((count) => {
    setMessagesCount(count);
  });

  conversation
    .setAllMessagesRead()
    .then(() => {
      setTimeout(() => {
        const el = document.getElementById("scroll-anchor");
        if (el) {
          el.scrollIntoView({
            behavior: "auto",
          });
        }
      }, 0);
    })
    .catch((err) => {
      console.log(err);
    });
}
