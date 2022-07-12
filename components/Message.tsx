import { Conversation, Message } from "@twilio/conversations";
import getUserId from "../queries/getUserId";
import { Participant } from "../types/Room";
import { LinkIt } from "react-linkify-it";
import Links from "./LinkComponent";
import RenderMedia from "./RenderMedia";
import timeAgo from "../utils/timeAgo";
import { useEffect, useState } from "react";
import { useHover } from "@react-aria/interactions";

type Props = {
  message: Message;
  participants: Participant[];
  conversation: Conversation;
};

export default function MessageComponent({
  message,
  participants,
  conversation,
}: Props) {
  const [targetElement, setTargetElement] = useState<HTMLDivElement | null>(
    null
  );
  const [removed, setRemoved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const userId = getUserId();
  const isCreator = userId === message.author;
  const regex = /(https?:\/\/[^\s]+)/g;

  const links = (message && message.body && message.body.match(regex)) || [];

  const mediaUrl = message.attachedMedia || [];

  function callback(
    entries: any[],
    observer: { unobserve: (arg0: any) => void }
  ) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    });
  }

  useEffect(() => {
    const el = document.getElementById(`message-${message.sid}`);

    if (el) {
      setTargetElement(el as HTMLDivElement);
    }
    const options = {
      root: (document && document?.body) || null,
      rootMargin: "0px",
      threshold: 0,
    };
    let observer = new IntersectionObserver(callback, options);
    if (targetElement) {
      observer.observe(targetElement as Element);
    }
    return () => {
      if (targetElement) observer.unobserve(targetElement as Element);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetElement]);

  useEffect(() => {
    if (isVisible) {
      conversation
        .advanceLastReadMessageIndex(message.index)
        .catch(console.error);
    }
  }, [isVisible, conversation, message]);

  const removeMessage = () => {
    if (!removed) {
      message.remove().catch((err) => {
        console.log("This message is already removed");
      });
      setRemoved(true);
    }
  };

  let { hoverProps, isHovered } = useHover({
    onHoverStart: () => {},
    onHoverEnd: () => {},
  });

  window.onkeydown = (e) => {
    // If the user presses the delete key and the message is hovered, remove it
    if (e.key === "Delete" && e.ctrlKey && isHovered && isCreator) {
      e.preventDefault();
      removeMessage();
    }
  };

  return (
    <div
      key={message.sid}
      id={`message-${message.sid}`}
      data-scroll-id={message.index}
      className="flex w-full px-2"
      style={{
        alignItems: "center",
        justifyContent: message.author === userId ? "flex-end" : "flex-start",
      }}
    >
      <div
        className="flex flex-col w-full"
        style={{
          textAlign: message.author === userId ? "right" : "left",
          alignItems: message.author === userId ? "flex-end" : "flex-start",
        }}
      >
        <div
          {...hoverProps}
          className="flex flex-col w-fit bg-blue-700 relative"
          style={{
            borderRadius:
              message.author === userId
                ? "1rem 1rem  0 1rem"
                : "0 1rem 1rem 1rem",
            padding: message.type === "text" ? "0.75rem 1rem" : "0.2rem",
            maxWidth: "75%",
            minWidth: "15%",
          }}
        >
          {message.type === "text" && (
            <>
              {message.author !== userId && (
                <p className="text-sm font-semibold text-white">
                  {participants.find((p) => p.id === message.author)?.name}
                </p>
              )}
              <LinkIt
                component={(match, key) => (
                  <a href={match} className="underline" key={key}>
                    {match}
                  </a>
                )}
                regex={regex}
              >
                <p className="font-messages tracking-normal md:tracking-wide text-sm">
                  {message.body}
                </p>
              </LinkIt>
            </>
          )}
          {message.type === "media" && (
            <div className="flex flex-col">
              {message.author !== userId && (
                <p className="text-sm font-semibold pl-2 pb-1 text-white">
                  {participants.find((p) => p.id === message.author)?.name}
                </p>
              )}
              <RenderMedia
                media={mediaUrl}
                id={message.sid}
                isVisible={isVisible}
              />
            </div>
          )}
        </div>
        {isVisible && links.length > 0 && <Links url={links[0]} />}
        {isCreator && isHovered ? (
          <span className="text-xs inline-flex text-white h-6 mt-1 items-center justify-end gap-1 px-1">
            <span className="border px-0.5 rounded">CTRL</span> +{" "}
            <span className="border px-0.5 rounded">DEL</span> para eliminar
          </span>
        ) : (
          <span className="inline-flex gap-1 items-center mt-1 h-6 justify-center">
            <TimeAgo date={message.dateCreated as Date} />
          </span>
        )}
      </div>
    </div>
  );
}

function TimeAgo({ date }: { date: Date }) {
  const [time, setTime] = useState(timeAgo(date));

  useEffect(() => {
    const int = setInterval(() => {
      setTime(timeAgo(date));
    }, 60 * 1000);

    return () => {
      clearInterval(int);
    };
  }, [date]);

  return <span className="text-xs text-white px-1">{time}</span>;
}
