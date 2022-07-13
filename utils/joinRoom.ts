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
  handleMessageAdded: (message: Message) => void,
  setMessagesCount: (count: number) => void
) {
  console.log({ isCreator, participants, roomId });

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
    console.log("messages count: ", count);
    setMessagesCount(count);
  });

  conversation
    .setAllMessagesRead()
    .then(() => {
      console.log("All messages read");
      scrollToBottom();
    })
    .catch((err) => {
      console.log(err);
    });

  console.log("Added old messages, scrolling to bottom...");
}
