import { Message } from "@twilio/conversations";
import { Participant } from "../types/Room";
import createOrJoinRoom from "./room";

export default async function joinRoom(
  roomId: string,
  accessToken: string,
  participants: Participant[] | null = null,
  isCreator: boolean = false,
  setConversation: (conversation: any) => void,
  setMessages: (messages: any) => void,
  scrollDiv: any,
  handleMessageAdded: (message: Message) => void
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

  const current = scrollDiv.current as HTMLElement;

  setTimeout(() => {
    if (current) {
      current.scrollTop = current.scrollHeight + 100;
      console.log({
        scrollTop: current.scrollTop,
        scrollHeight: current.scrollHeight,
        clientHeight: current.clientHeight,
      });
      conversation
        .setAllMessagesRead()
        .then(() => {
          console.log("All messages read");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("No scrollDiv");
    }
  }, 100);

  console.log("Added old messages, scrolling to bottom...");

  conversation.on("messageAdded", (message: Message) =>
    handleMessageAdded(message)
  );

  conversation.on("messageRemoved", (message: Message) =>
    // Remove message from state
    setMessages((messages: any) =>
      messages.filter((m: any) => m.sid !== message.sid)
    )
  );
}
