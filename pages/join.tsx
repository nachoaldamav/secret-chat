import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { nhost } from "../libs/nhost";
import getUserId from "../queries/getUserId";
import withAuth from "../utils/withAuth";

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
  const { id } = router.query;

  useEffect(() => {
    async function addData() {
      const alreadyJoined = await checkIfUserAlreadyJoined(
        userId as string,
        id as string
      );

      if (alreadyJoined) {
        router.push(`/chat/${id}`);
        return;
      }

      const { data, error } = await nhost.graphql.request(ADD_CHAT, {
        room_id: id,
        user_id: userId,
      });

      if (error) {
        console.error(error);
        return;
      }

      const chatId = data.insert_chat_one.room_id;

      router.push(`/chat/${chatId}`);
    }

    if (accessToken && userId) {
      addData();
    }
  }, [router, userId, accessToken, id]);

  return (
    <section className="w-full h-full flex flex-col justify-center items-center gap-2">
      <h1 className="text-2xl font-bold">Entrando al chat...</h1>
      <Spinner />
    </section>
  );
}

async function checkIfUserAlreadyJoined(userId: string, roomId: string) {
  const { data, error } = await nhost.graphql.request(
    gql`
      query CheckIfUserAlreadyJoined($user_id: uuid, $room_id: uuid) {
        chat(
          where: { user_id: { _eq: $user_id }, room_id: { _eq: $room_id } }
        ) {
          id
        }
      }
    `,
    {
      room_id: roomId,
      user_id: userId,
    }
  );

  if (error) {
    console.error(error);
    return true;
  }

  return data.chat.length > 0;
}

export default withAuth(CreatePage);
