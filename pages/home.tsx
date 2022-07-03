import withAuth from "../utils/withAuth";
import { useState, useEffect } from "react";
import getChats, { Chat } from "../queries/getChats";
import { nhost } from "../libs/nhost";

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
        setChats(res?.data);
      }
      setLoading(false);
    }

    fetchData();

    const accessToken = nhost.auth.getAccessToken();
    if (accessToken) {
      fetch("/api/get-token", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          console.log(res.json());
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return (
    <section className="w-full h-full flex flex-col justify-start items-start px-2">
      <h1 className="text-2xl font-display text-left text-black dark:text-white font-bold">
        Chats
      </h1>
      {error && (
        <span className="flex flex-col text-2xl font-bold self-center mt-10">
          Error al cargar tus chats.
          <pre className="text-sm max-w-full overflow-y-visible">
            {JSON.stringify(error, null, 2)}
          </pre>
        </span>
      )}
    </section>
  );
}

export default withAuth(Home);
