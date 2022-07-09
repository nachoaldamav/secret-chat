import Link from "next/link";
import { useEffect, useState } from "react";
import { useTwilioConfig } from "../hooks/useTwilioConfig";
import { nhost } from "../libs/nhost";
import type { Chat } from "../queries/getChats";
import getHomeMessages, { HomeMessage } from "../utils/getHomeMessages";
import MessageSkeleton from "./MessageLoader";

export default function ChatItem({ chat }: { chat: Chat }) {
  const [info, setInfo] = useState<HomeMessage | null>(null);
  const isAuthenticated = nhost.auth.isAuthenticated();
  const { config } = useTwilioConfig();
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

  useEffect(() => {
    if (config.accessToken) {
      getHomeMessages(chat.id, config.accessToken).then((info) =>
        setInfo(info)
      );
    }
  }, [chat.id, config]);

  return (
    <Link href={"/chat/[room]"} as={`/chat/${chat.id}`}>
      <a className="flex flex-col justify-start items-start mb-2 w-full bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out rounded-lg px-2 py-1">
        <div className="flex flex-row gap-1 justify-start items-start">
          <div className="h-fit w-fit relative">
            {info && info.unread > 0 && (
              <span className="absolute bottom-0 right-1 bg-blue-600 rounded-full h-6 w-6 inline-flex justify-center items-center">
                <span className="text-xs text-white font-bold">
                  {info?.unread < 10 ? info?.unread : "9+"}
                </span>
              </span>
            )}
            <img
              src={chat.icon ?? creator?.avatar}
              alt={creator?.name}
              className="w-12 h-12 rounded-full mr-2"
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="font-bold">{creator?.name}</div>
            {info ? (
              <div className="text-sm inline-flex gap-1">
                {info.author}
                {": "}
                {info?.message.body && info?.message.body?.length < 30
                  ? info?.message.body
                  : info?.message.body?.slice(0, 30) + "..."}
              </div>
            ) : (
              <MessageSkeleton
                speed={2}
                backgroundColor="#1e293b"
                foregroundColor="#475569"
              />
            )}
          </div>
        </div>
      </a>
    </Link>
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
