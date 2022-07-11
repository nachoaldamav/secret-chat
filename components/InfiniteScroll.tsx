import { Message } from "@twilio/conversations";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function handleScroll(container: HTMLElement) {
      if (container.scrollTop === 0 && hasMore && !isLoading) {
        setIsLoading(true);
        await loadMore();
        setIsLoading(false);
        // Get element by "scroll-id"
        if (lastElement) {
          lastElement.scrollIntoView();
        }
      }
    }

    const container = document.getElementById("messages");
    if (container) {
      container.addEventListener("scroll", () => handleScroll(container));
    }

    return () => {
      container?.removeEventListener("scroll", () => handleScroll(container));
    };
  }, [hasMore, isLoading, loadMore, itemsLength, total, lastElement]);

  useEffect(() => {
    const scrollId = document.querySelector(
      `[data-scroll-id="${lastElementIndex?.index || 20}"]`
    );
    if (scrollId) {
      setLastElement(scrollId as HTMLDivElement);
    } else {
      console.log("scrollId not found", lastElementIndex);
    }
  }, [lastElementIndex]);

  return (
    <>
      <span
        id="end"
        className="my-10 w-full flex flex-col justify-center items-center"
      >
        {isLoading ? "Cargando mensajes antiguos..." : ""}
        {!isLoading && !hasMore && itemsLength > 0
          ? "Has llegado al final"
          : "No hay mensajes, ¡empieza a escribir!"}
      </span>
      {children}
    </>
  );
}

type Props = {
  children: React.ReactNode;
  itemsLength: number;
  hasMore: boolean;
  total: number;
  loadMore: () => Promise<void>;
  lastElementIndex: Message;
};
