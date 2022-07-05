import withAuth from "../utils/withAuth";
import { useState, useEffect } from "react";
import getChats, { Chat } from "../queries/getChats";
import Spinner from "../components/Spinner";
import ChatItem from "../components/ChatItem";

function Home() {
  const [chats, setChats] = useState<Chat[] | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getChats();
      if (res?.error !== null) {
        console.log(res);
        setError(res?.error);
      } else {
        setChats(res?.data.room);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <section className="w-full h-full flex flex-col justify-start items-start px-2">
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
          {chats?.length > 0 &&
            chats.map((chat) => <ChatItem chat={chat} key={chat.id} />)}
        </ul>
      )}
    </section>
  );
}

export default withAuth(Home);
