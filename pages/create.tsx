import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import useTwilio from "../hooks/twilio";
import { nhost } from "../libs/nhost";
import getUserId from "../queries/getUserId";
import withAuth from "../utils/withAuth";

const GENERATE_ROOM = gql`
  mutation GenerateRoom($creator_id: uuid = creator_id) {
    insert_room_one(object: { creator_id: $creator_id }) {
      id
    }
  }
`;

const ADD_CHAT = gql`
  mutation AddChat($room_id: uuid = room_id, $user_id: uuid = user_id) {
    insert_chat_one(object: { room_id: $room_id, user_id: $user_id }) {
      room_id
    }
  }
`;

function CreatePage() {
  const router = useRouter();
  const userId = getUserId();
  const accessToken = nhost.auth.getAccessToken();
  const isAuthenticated = nhost.auth.isAuthenticated();
  const { client } = useTwilio();

  useEffect(() => {
    async function addData() {
      nhost.graphql.setAccessToken(accessToken);
      const { data, error } = await nhost.graphql.request(GENERATE_ROOM, {
        creator_id: userId,
      });

      if (error) {
        console.error(error);
        return;
      }

      const roomId = data.insert_room_one.id;

      const { data: chatData, error: chatError } = await nhost.graphql.request(
        ADD_CHAT,
        {
          room_id: roomId,
          user_id: userId,
        }
      );

      if (chatError) {
        console.error(chatError);
        return;
      }

      const chatId = chatData.insert_chat_one.room_id;

      await client?.createConversation({
        uniqueName: chatId,
      });

      router.push(`/chat/${chatId}`);
    }

    if (accessToken && userId && isAuthenticated) {
      addData();
    }
  }, [router, userId, accessToken, isAuthenticated, client]);

  return (
    <section className="w-full h-full flex flex-col justify-center items-center gap-2">
      <h1 className="text-2xl font-bold">Creando un nuevo chat...</h1>
      <Spinner />
    </section>
  );
}

export default withAuth(CreatePage);
