import withAuth from "../utils/withAuth";
import { useEffect } from "react";
import { Chat } from "../queries/getChats";
import Spinner from "../components/Spinner";
import ChatItem from "../components/ChatItem";
import { useTwilioConfig } from "../hooks/useTwilioConfig";
import { nhost } from "../libs/nhost";
import { useAuthSubscription } from "@nhost/react-apollo";
import { gql } from "@apollo/client";
import getUserId from "../queries/getUserId";

function Home() {
  const id = getUserId();
  const { config, setConfig } = useTwilioConfig();

  const QUERY_PROD = gql`
    subscription getRooms($_eq: uuid = _eq) {
      room(
        order_by: { updated_at: desc }
        where: { chats: { user_id: { _eq: $_eq } } }
        distinct_on: updated_at
      ) {
        id
        icon
        creator_id
        updated_at
        name
        chats {
          user_data {
            custom_avatar
            id
            user {
              avatarUrl
              displayName
            }
          }
        }
      }
    }
  `;

  useEffect(() => {
    if (!config.accessToken) {
      fetch("/api/get-token", {
        headers: {
          Authorization: `Bearer ${nhost.auth.getAccessToken()}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setConfig({
            accessToken: res.token,
            expirationDate: new Date().getTime() + res.ttl * 1000,
          });
        })
        .catch((err) => {
          console.error("Something failed while getting token: ", err);
        });
    }
  }, [config, setConfig]);

  const { data, loading, error } = useAuthSubscription(QUERY_PROD, {
    variables: {
      _eq: id,
    },
  });

  const chats: Response = data;

  return (
    <section className="w-full h-full flex flex-col justify-start items-start px-4 py-3">
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

      {chats && (
        <ul className="w-full h-full flex flex-col justify-start items-start gap-2 overflow-x-auto pb-16">
          {chats.room.length > 0 &&
            chats.room.map((chat: Chat) => (
              <ChatItem chat={chat} key={chat.id} />
            ))}
        </ul>
      )}
    </section>
  );
}

type Response = {
  room: Chat[];
};

export default withAuth(Home);
