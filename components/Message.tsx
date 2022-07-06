import { Media, Message } from "@twilio/conversations";
import Link from "next/link";
import { useEffect, useState } from "react";
import getUserId from "../queries/getUserId";
import { Participant } from "../types/Room";
import { LinkIt } from "react-linkify-it";
import Image from "next/image";

function scrollToBottom() {
  setTimeout(() => {
    const container = document.getElementById("messages");
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, 0);
}

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

function Links({ url }: { url: string }) {
  // Remove all query strings from the url
  const urlWithoutQueryString = url;
  const [data, setData] = useState<{
    title: string;
    description: string;
    image: string;
  }>();

  useEffect(() => {
    fetch(`/api/generate-thumbnail?url=${urlWithoutQueryString}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        scrollToBottom();
      });
  }, [urlWithoutQueryString]);

  if (!data?.title || !data.description || !data.image) {
    return null;
  }

  return (
    <Link href={url}>
      <a
        className="flex flex-col h-fit w-full gap-2 border mt-2 border-white rounded-xl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={data.image}
          width={200}
          height={160}
          className="w-full h-fit rounded-t-xl"
          objectFit="cover"
          layout="intrinsic"
          unoptimized
          alt={data.title}
        />
        <div className="flex flex-col h-fit w-full gap-2 p-2">
          <h2 className="text-sm font-semibold text-white">{data.title}</h2>
          {data.description && (
            <p className="text-xs font-light text-white">{data.description}</p>
          )}
        </div>
      </a>
    </Link>
  );
}

function RenderMedia({ media, id }: { media: Media[]; id: string }) {
  const options = {
    root: (document && document?.body) || null,
    rootMargin: "0px",
    threshold: 0,
  };

  function callback(entries, observer) {}

  let observer = new IntersectionObserver(callback, options);

  const targetElement = document.getElementById(`message-${id}`);
  const raw = media[0];
  const [url, setUrl] = useState<string>();

  if (targetElement) observer.observe(targetElement as Element);

  useEffect(() => {
    async function fetchFile() {
      const cached = await raw.getCachedTemporaryUrl();

      if (!cached) {
        const url = await raw.getContentTemporaryUrl();
        setUrl(url as string);
        return;
      }
      setUrl(cached);
      scrollToBottom();
    }

    if (raw) {
      fetchFile();
    }
  }, [raw]);

  if (!url) {
    return null;
  }

  const filetype = raw.contentType;

  if (filetype.startsWith("image")) {
    return (
      <Image
        src={url}
        width={200}
        height={160}
        className="w-full h-fit rounded-t-xl"
        layout="intrinsic"
        unoptimized
        alt={raw.filename || ""}
      />
    );
  } else if (filetype.startsWith("video")) {
    return (
      <video
        src={url}
        width={200}
        height={160}
        className="w-full h-fit rounded-t-xl"
        controls
      />
    );
  } else if (filetype.startsWith("audio")) {
    return (
      <div className="inline-flex justify-center items-center">
        <audio src={url} className="w-60 h-20 rounded-t-xl" controls />
      </div>
    );
  } else {
    return null;
  }
}

type Props = {
  message: Message;
  participants: Participant[];
};
