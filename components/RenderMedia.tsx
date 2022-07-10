import { DownloadIcon } from "@heroicons/react/outline";
import { Media } from "@twilio/conversations";
import Image from "next/image";
import { useEffect, useState } from "react";
import getImageDimensions from "../utils/getImageDimensions";
import AudioPlayer from "./AudioPlayer";

export default function RenderMedia({
  media,
  isVisible,
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

  useEffect(() => {
    async function fetchFile() {
      const cached = await raw.getCachedTemporaryUrl();
      fetch(cached as string)
        .then(async (res) => {
          setUrl(res.url);
          if (raw.contentType.startsWith("image")) {
            const { width, height } = await getImageDimensions(res.url);
            setDimensions({ width, height });
            scroll(containerEl as HTMLElement);
          }
        })
        .catch(async (err) => {
          const url = await raw.getContentTemporaryUrl();
          setUrl(url as string);
          if (raw.contentType.startsWith("image")) {
            const { width, height } = await getImageDimensions(url as string);
            setDimensions({ width, height });
            scroll(containerEl as HTMLElement);
          }
          return;
        });
    }

    if (raw && isVisible) {
      fetchFile();
    }
  }, [raw, isVisible, containerEl]);

  if (!url) {
    return <div className="h-10 w-20"></div>;
  }

  const filetype = raw.contentType;

  if (filetype.startsWith("image")) {
    return (
      <Image
        src={url}
        layout="intrinsic"
        width={dimensions?.width ?? 200}
        height={dimensions?.height ?? 200}
        className="rounded-xl cursor-pointer"
        objectFit="cover"
        alt={raw.filename || ""}
        onClick={() => {
          console.log(raw.filename);
        }}
      />
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
      top: container.scrollHeight,
      behavior: "smooth",
    });
}
