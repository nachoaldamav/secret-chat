import { Message } from "@twilio/conversations";
import getUserId from "../queries/getUserId";
import { Participant } from "../types/Room";
import { LinkIt } from "react-linkify-it";
import Links from "./LinkComponent";
import RenderMedia from "./RenderMedia";

export default function MessageComponent({ message, participants }: Props) {
  const userId = getUserId();

  const regex = /(https?:\/\/[^\s]+)/g;

  const links = (message && message.body && message.body.match(regex)) || [];

  const mediaUrl = message.attachedMedia || [];

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
        className="flex flex-col w-fit bg-blue-700 px-3 py-4"
        style={{
          textAlign: message.author === userId ? "right" : "left",
          borderRadius:
            message.author === userId ? "1rem 1rem  0 1rem" : "0.5rem 0 0 0",
          maxWidth: "75%",
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
    </div>
  );
}

type Props = {
  message: Message;
  participants: Participant[];
};
