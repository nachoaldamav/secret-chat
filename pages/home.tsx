import withAuth from "../utils/withAuth";
import { useCallback, useEffect, useState } from "react";
import { Chat, QUERY_PROD } from "../queries/getChats";
import Spinner from "../components/Spinner";
import ChatItem from "../components/ChatItem";
import { useTwilioConfig } from "../hooks/useTwilioConfig";
import { nhost } from "../libs/nhost";
import { useAuthSubscription } from "@nhost/react-apollo";
import getUserId from "../queries/getUserId";
import Link from "next/link";
import useTwilio from "../hooks/twilio";
import {
  initServiceWorker,
  showNotification,
  suscribeToNotifications,
} from "../libs/firebase";
import { Client } from "@twilio/conversations";
import Head from "next/head";
import type { unread } from "../types/unread";

async function refreshToken(): Promise<{
  token: string;
  ttl: number;
}> {
  return fetch("/api/get-token", {
    headers: {
      Authorization: `Bearer ${nhost.auth.getAccessToken() as string}`,
    },
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
}

function Home() {
  const id = getUserId();
  const { config, setConfig } = useTwilioConfig();
  const { client } = useTwilio();
  const [unreadMessages, setUnreadMessages] = useState<unread[]>([]);

  // Wrap in useCallback
  const handleTokenRefresh = useCallback(async () => {
    try {
      const { token, ttl } = await refreshToken();
      setConfig({
        accessToken: token,
        expirationDate: new Date().getTime() + ttl * 1000,
      });
    } catch (err) {
      console.error(err);
    }
  }, [setConfig]);

  useEffect(() => {
    if (!config.accessToken) {
      handleTokenRefresh();
    }
  }, [config, setConfig, handleTokenRefresh]);

  useEffect(() => {
    const fcmInit = async () => {
      await initServiceWorker();
      await suscribeToNotifications(client as Client);
    };

    if (client) {
      fcmInit();
      client.on("tokenExpired", () => {
        handleTokenRefresh();
      });
    }

    return () => {
      client?.removeAllListeners();
    };
  }, [client, handleTokenRefresh]);

  const { data, loading, error } = useAuthSubscription(QUERY_PROD, {
    variables: {
      _eq: id,
    },
  });

  const chats: Response = data;

  const unreadMessagesCount = unreadMessages.reduce(
    (acc, { unread }) => acc + unread,
    0
  );

  return (
    <section className="w-full h-full flex flex-col justify-start items-start px-4 py-3">
      <Head>
        <title>
          {unreadMessagesCount > 0 ? `(${unreadMessagesCount}) ` : ""}Inicio -
          Secret Chat
        </title>
      </Head>

      <h1 className="text-2xl font-display text-left text-black dark:text-white font-bold">
        Chats
      </h1>
      {error && (
        <span className="flex flex-col text-2xl font-bold self-center mt-10">
          Error al cargar tus chats.
        </span>
      )}
      {loading && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold">Cargando tus chats...</h1>
          <Spinner />
        </div>
      )}

      {chats && chats.room.length > 0 && (
        <ul className="w-full h-[100%] flex flex-col justify-start items-start gap-2 overflow-x-auto pb-16">
          {chats.room.map((chat: Chat) => (
            <ChatItem
              chat={chat}
              key={chat.id}
              setUnread={setUnreadMessages}
              unreadMessages={unreadMessages}
            />
          ))}
        </ul>
      )}
      {chats && chats.room.length === 0 && (
        <div className="flex flex-col text-2xl font-bold self-center items-center gap-4 mt-10">
          <span>No tienes chats.</span>
          <Link href={"/create"}>
            <a className="px-6 w-fit py-2 font-bold bg-blue-600 text-xl rounded-xl">
              Crear una sala
            </a>
          </Link>
        </div>
      )}
    </section>
  );
}

type Response = {
  room: Chat[];
};

export default withAuth(Home);
