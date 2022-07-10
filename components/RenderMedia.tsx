import { DownloadIcon, ExclamationIcon } from "@heroicons/react/outline";
import { Media } from "@twilio/conversations";
import Image from "next/image";
import { useEffect, useState } from "react";
import getImageDimensions from "../utils/getImageDimensions";
import scrollToBottom from "../utils/scrollToBottom";
import AudioPlayer from "./AudioPlayer";

export default function RenderMedia({
  media,
  isVisible,
  id,
}: {
  media: Media[];
  id: string;
  isVisible: boolean;
}) {
  const containerEl = document.getElementById(`messages`);
  const raw = media[0];
  const [url, setUrl] = useState<string>();
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [hasBlur, setHasBlur] = useState(false);

  useEffect(() => {
    async function fetchFile() {
      const cached = await raw.getCachedTemporaryUrl();
      fetch(cached as string)
        .then(async (res) => {
          setUrl(res.url);
          if (raw.contentType.startsWith("image")) {
            const { width, height } = await getImageDimensions(res.url);
            setDimensions({ width, height });
            scrollToBottom();
            setHasBlur(raw?.filename?.includes("-blur") ?? false);
          }
        })
        .catch(async (err) => {
          const url = await raw.getContentTemporaryUrl();
          setUrl(url as string);
          if (raw.contentType.startsWith("image")) {
            const { width, height } = await getImageDimensions(url as string);
            setDimensions({ width, height });
            scrollToBottom();
            setHasBlur(raw?.filename?.includes("-blur") ?? false);
          }
          return;
        });
    }

    if (raw && isVisible) {
      fetchFile();
      console.log("fetching file because it's visible");
    }
  }, [raw, isVisible, containerEl]);

  if (!url) {
    return <div className="h-10 w-20"></div>;
  }

  const filetype = raw.contentType;

  if (filetype.startsWith("image")) {
    const blur = raw.filename?.includes("-blur") ?? false;
    return (
      <div className="h-fit w-fit flex flex-col relative items-center justify-center">
        {hasBlur && (
          <span
            className="inset-0 absolute z-[9999] text-white flex flex-col justify-center items-center text-center text-sm cursor-pointer"
            onClick={() => setHasBlur(false)}
          >
            <ExclamationIcon className="h-8 w-8" />
            <span className="font-bold">
              Esta imagen podría contener información sensible.
            </span>
          </span>
        )}
        <Image
          src={url}
          layout="intrinsic"
          width={dimensions?.width ?? 200}
          height={dimensions?.height ?? 200}
          className="rounded-xl cursor-pointer transition self-center duration-300 ease-in-out"
          style={{
            filter: hasBlur ? "blur(50px)" : "blur(0px)",
          }}
          objectFit="cover"
          id={`image-${id}`}
          priority={isVisible ? true : false}
          alt={raw.filename || ""}
        />
      </div>
    );
  } else if (filetype.startsWith("video")) {
    return <video src={url} className="w-full h-fit rounded-t-xl" controls />;
  } else if (filetype.startsWith("audio")) {
    return <AudioPlayer url={url} />;
  } else if (filetype.startsWith("application")) {
    return (
      <a
        href={url}
        download={raw.filename}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex justify-between gap-2 items-center px-2 py-3"
      >
        <DownloadIcon className="h-6 w-6" />
        <span>{raw.filename}</span>
      </a>
    );
  }

  return null;
}

function scroll(container: HTMLElement) {
  container &&
    container.scrollTo({
      top: container.scrollHeight + 100,
      behavior: "smooth",
    });
}
