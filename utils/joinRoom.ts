import { Message } from "@twilio/conversations";
import { Participant } from "../types/Room";
import createOrJoinRoom from "./room";
import scrollToBottom from "./scrollToBottom";

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

  setTimeout(() => {
    scrollToBottom(scrollDiv);
  }, 100);

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
