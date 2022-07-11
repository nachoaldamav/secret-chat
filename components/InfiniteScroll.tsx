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

  useEffect(() => {
    function handleScroll(container: HTMLElement) {
      if (container.scrollTop === 0 && hasMore) {
        console.log({
          itemsLength,
          total,
          result: itemsLength < total,
        });
        loadMore();
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
  }, [itemsLength, total, loadMore, lastElement, hasMore]);

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
      <span id="end"></span>
      {children}
    </>
  );
}

type Props = {
  children: React.ReactNode;
  itemsLength: number;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  lastElementIndex: Message;
};
