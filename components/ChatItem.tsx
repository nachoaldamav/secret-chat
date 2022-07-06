import Link from "next/link";
import type { Chat } from "../queries/getChats";

export default function ChatItem({ chat }: { chat: Chat }) {
  const creator_id = chat.creator_id;
  const participants = chat.chats.map((chat) => {
    const id = chat.user_data.id;
    const avatar =
      chat.user_data.custom_avatar ?? chat.user_data.user.avatarUrl;
    const name = chat.user_data.user.displayName;
    const isCreator = creator_id === id;

    return { id, avatar, name, isCreator };
  });

  const creator = participants.find((p) => p.isCreator);

  return (
    <li className="flex flex-col justify-start items-start mb-2 border w-full rounded-lg px-2 py-1">
      <Link href={"/chat/[room]"} as={`/chat/${chat.id}`}>
        <a className="flex flex-row gap-1 justify-start items-start">
          <img
            src={chat.icon ?? creator?.avatar}
            alt={creator?.name}
            className="w-12 h-12 rounded-full mr-2"
          />
          <span className="text-lg font-bold">{renderNames(participants)}</span>
        </a>
      </Link>
    </li>
  );
}

function renderNames(participants: { id: string; name: string }[]) {
  // render 2 names and append "and" n more if there are more than 2
  const names = participants.map((p) => p.name);
  const last = names.pop();
  const rest = names.join(", ");
  const and = names.length > 1 ? " y " : "";

  return `${rest}${and}${last}`;
}
