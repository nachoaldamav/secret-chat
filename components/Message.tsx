import { Message } from "@twilio/conversations";
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
};

export default function MessageComponent({ message, participants }: Props) {
  const [removed, setRemoved] = useState(false);
  const userId = getUserId();
  const isCreator = userId === message.author;
  const regex = /(https?:\/\/[^\s]+)/g;

  const links = (message && message.body && message.body.match(regex)) || [];

  const mediaUrl = message.attachedMedia || [];

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
      className="flex w-full pr-2"
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
          className="flex flex-col w-fit bg-blue-700 px-3 py-4 relative"
          style={{
            borderRadius:
              message.author === userId
                ? "1rem 1rem  0 1rem"
                : "0 1rem 1rem 1rem",
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
              {links.length > 0 && <Links url={links[0]} />}
            </>
          )}
          {message.type === "media" && (
            <RenderMedia media={mediaUrl} id={message.sid} />
          )}
        </div>
        {isCreator && isHovered ? (
          <span className="text-xs text-white py-1 px-1">
            CTRL + Del para eliminar
          </span>
        ) : (
          <TimeAgo date={message.dateCreated as Date} />
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

  return <span className="text-xs text-white py-1 px-1">{time}</span>;
}