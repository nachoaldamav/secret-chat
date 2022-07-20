import { Message } from "@twilio/conversations";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useTwilio from "../hooks/twilio";
import { useTwilioConfig } from "../hooks/useTwilioConfig";
import type { Chat } from "../queries/getChats";
import type { unread } from "../types/unread";
import { getName, HomeMessage } from "../utils/getHomeMessages";
import MessageSkeleton from "./MessageLoader";

export default function ChatItem({
  chat,
  setUnread,
  unreadMessages,
}: {
  chat: Chat;
  setUnread: any;
  unreadMessages: unread[];
}) {
  const [info, setInfo] = useState<HomeMessage | null>(null);
  const { config } = useTwilioConfig();
  const { client } = useTwilio();
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
    async function getMessage() {
      try {
        const conversation = await client?.getConversationByUniqueName(chat.id);
        const lastMessage = await conversation?.getMessages(1);
        const message = lastMessage?.items[0] as Message;
        const unread = (await conversation?.getUnreadMessagesCount()) ?? 0;
        const author = await getName(message?.author as string);
        const timestamp = message?.dateUpdated?.toISOString() ?? "";

        setInfo({ author, message, timestamp, unread });

        // Remove previous unread message
        const previousUnread = unreadMessages.find(
          (u) => u.chat_id === chat.id
        );

        if (previousUnread) {
          setUnread(unreadMessages.filter((u) => u.chat_id !== chat.id));
        }

        // Add new unread message
        if (unread > 0) {
          setUnread([...unreadMessages, { chat_id: chat.id, unread }]);
        }
      } catch (e) {
        console.error("Fetch last message failed", e);
        setInfo({
          author: "",
          message: null,
          timestamp: "",
          unread: 0,
        });
      }
    }

    if (config.accessToken) {
      getMessage();
      client?.addListener("messageAdded", getMessage);

      return () => {
        client?.removeListener("messageAdded", getMessage);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id, config, client]);

  return (
    <Link href={"/chat/[room]"} as={`/chat/${chat.id}`}>
      <a className="flex flex-col justify-start items-start mb-2 w-full bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out rounded-lg px-2 py-1 font-messages">
        <div className="flex flex-row gap-2 justify-start items-start w-full">
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
                `https://source.boringavatars.com/beam/120/${chat.id}?colors=796C86,2a9d8f,e9c46a,f4a261,e76f51`
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
          <div className="flex flex-col justify-start items-start w-full">
            <div className="flex flex-row justify-between items-center w-full">
              <div className="font-bold">{chat?.name || "Sala sin nombre"}</div>
              <span className="font-light text-xs">
                {info?.timestamp && timeAgo(info?.timestamp)}
              </span>
            </div>
            {info ? (
              <div className="text-sm inline-flex gap-1">
                {info.author || "No hay mensajes"}
                {info.author && ": "}
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
        : message.body?.slice(0, 15) + "...";
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

function timeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Ahora";
  } else if (minutes < 60) {
    return `${minutes} min`;
  } else if (hours < 24) {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "numeric",
    });
  } else {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }
}
