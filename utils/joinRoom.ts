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
  scrollDiv: any
) {
  const handleMessageAdded = (message: Message) => {
    setMessages((messages: any) => [...messages, message]);
    scrollToBottom(scrollDiv);
  };

  const conversation = await createOrJoinRoom(
    roomId,
    accessToken as string,
    participants,
    isCreator as boolean
  );

  setConversation(conversation);
  const messages = await conversation.getMessages();
  setMessages(messages.items);

  scrollToBottom(scrollDiv);

  conversation.on("messageAdded", (message: Message) =>
    handleMessageAdded(message)
  );
}
