import { Conversation } from "@twilio/conversations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useTwilio from "../hooks/twilio";
import getUserId from "../queries/getUserId";
import type { Participant } from "../types/Room";

export default function Typing({
  participants,
}: {
  participants: Participant[];
}) {
  const userId = getUserId();
  const router = useRouter();
  const { room } = router.query;
  const { client } = useTwilio();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    async function getConversation() {
      const conversations = await client?.getConversationByUniqueName(
        room as string
      );
      setConversation(conversations as Conversation);
    }

    if (client && room) {
      getConversation();
    }
  }, [client, room]);

  useEffect(() => {
    if (conversation) {
      conversation?.on("typingStarted", async (user) => {
        if (user.identity !== userId) {
          setUsers((prev) => [...prev, user.identity as string]);
        }
      });

      conversation?.on("typingEnded", async (user) => {
        if (user.identity !== userId) {
          setUsers((prev) =>
            prev.filter((u) => u !== (user.identity as string))
          );
        }
      });
    }
  }, [conversation, userId]);

  function getName(sid: string) {
    const participant = participants.find((p) => p.id === sid);
    return participant?.name;
  }

  function renderString() {
    if (users.length === 0) {
      return null;
    }

    if (users.length === 1) {
      return `${getName(users[0])} está escribiendo...`;
    }

    if (users.length === 2) {
      return `${getName(users[0])} and ${getName(
        users[1]
      )} están escribiendo...`;
    }

    if (users.length === 3) {
      return `${getName(users[0])}, ${getName(users[1])} y ${getName(
        users[2]
      )} estan escribiendo...`;
    }

    return `Varias personas estan escribiendo...`;
  }

  return (
    <div className="absolute inset-0 w-full h-fit px-4 inline-flex">
      {renderString()}
    </div>
  );
}
