import { Message } from "@twilio/conversations";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTwilioConfig } from "../hooks/useTwilioConfig";
import type { Chat } from "../queries/getChats";
import getHomeMessages, { HomeMessage } from "../utils/getHomeMessages";
import MessageSkeleton from "./MessageLoader";

export default function ChatItem({ chat }: { chat: Chat }) {
  const [info, setInfo] = useState<HomeMessage | null>(null);
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
      <a className="flex flex-col justify-start items-start mb-2 w-full bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out rounded-lg px-2 py-1 font-messages">
        <div className="flex flex-row gap-2 justify-start items-start">
          <div className="h-fit w-fit relative inline-flex gap-1">
            {info && info.unread > 0 && (
              <span className="absolute top-0 left-0 z-[99999999999] bg-blue-600 rounded-full h-6 w-6 inline-flex justify-center items-center">
                <span className="text-xs text-white font-semibold ">
                  {info?.unread < 10 ? info?.unread : "9+"}
                </span>
              </span>
            )}
            <Image
              src={
                chat.icon ||
                creator?.avatar ||
                "https://via.placeholder.com/150"
              }
              alt={creator?.name}
              className="w-12 h-12 rounded-full mr-2"
              width={43}
              height={44}
              objectFit="cover"
              layout="intrinsic"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="font-bold">{creator?.name}</div>
            {info ? (
              <div className="text-sm inline-flex gap-1">
                {info.author}
                {": "}
                {info?.message && getText(info?.message)}
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

function getText(message: Message) {
  const type = message.type || "text";

  if (message) {
    if (type === "text") {
      return message.body && message.body?.length < 30
        ? message.body
        : message.body?.slice(0, 30) + "...";
    } else if (type === "media") {
      const mediaType =
        (message.attachedMedia && message?.attachedMedia[0]?.contentType) ||
        "undefined";

      if (mediaType === "image/jpeg" || mediaType === "image/png") {
        return "🖼️ [Imagen]";
      } else if (mediaType === "video/mp4") {
        return "🎥 [Vídeo]";
      } else if (mediaType === "audio/mp3") {
        return "🎵 [Audio]";
      } else if (mediaType === "application/pdf") {
        return "📄 [Documento]";
      } else if (mediaType === "audio/wav") {
        return "🎤 [Audio]";
      } else {
        return "📎 [Archivo]";
      }
    }
  }
}

function renderNames(participants: { id: string; name: string }[]) {
  // render 2 names and append "and" n more if there are more than 2
  const names = participants.map((p) => p.name);
  const last = names.pop();
  const rest = names.join(", ");
  const and = names.length > 1 ? " y " : "";

  return `${rest}${and}${last}`;
}
