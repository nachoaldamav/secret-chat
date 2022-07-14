import { Message } from "@twilio/conversations";
import { useState } from "react";

export default function InfiniteScroll({
  children,
  itemsLength,
  hasMore,
  total,
  loadMore,
  lastElementIndex,
}: Props) {
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function addMoreMessages() {
    if (hasMore && !isLoading) {
      await getLastElement();
      setIsLoading(true);
      await loadMore();
      goToLastElement();
      setIsLoading(false);
    }
  }

  async function getLastElement() {
    // Get first div of "messages" id
    const messages = document.getElementById("messages");

    if (messages) {
      const secondElement = messages.children[1];
      if (secondElement) {
        setLastElement(secondElement as HTMLDivElement);
        return;
      }
    }
  }

  function goToLastElement() {
    if (lastElement) {
      setTimeout(() => {
        lastElement.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }

  console.log("lastElement", lastElement);

  return (
    <>
      {itemsLength !== null && (
        <span
          id="end"
          className="my-10 w-full flex flex-col justify-center items-center"
        >
          {hasMore && !isLoading && (
            <button
              className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 duration-200 transition ease-in-out"
              onClick={addMoreMessages}
            >
              Cargar más mensajes
            </button>
          )}
          {!isLoading && !hasMore && "Has llegado al final"}
          {isLoading && "Cargando mensajes..."}
        </span>
      )}
      {children}
    </>
  );
}

type Props = {
  children: React.ReactNode;
  itemsLength: number | null;
  hasMore: boolean;
  total: number;
  loadMore: () => Promise<void>;
  lastElementIndex: Message;
};
