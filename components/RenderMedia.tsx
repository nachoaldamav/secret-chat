import { Media } from "@twilio/conversations";
import Image from "next/image";
import { useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";

export default function RenderMedia({
  media,
  id,
  isVisible,
}: {
  media: Media[];
  id: string;
  isVisible: boolean;
}) {
  const raw = media[0];
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    async function fetchFile() {
      const cached = await raw.getCachedTemporaryUrl();
      fetch(cached as string)
        .then((res) => {
          setUrl(res.url);
        })
        .catch(async (err) => {
          const url = await raw.getContentTemporaryUrl();
          setUrl(url as string);
          return;
        });
    }

    if (raw && isVisible) {
      fetchFile();
    }
  }, [raw, isVisible]);

  if (!url) {
    return <div className="h-10 w-20"></div>;
  }

  const filetype = raw.contentType;

  if (filetype.startsWith("image")) {
    return (
      <div
        style={{ position: "relative", width: "100%", paddingBottom: "100%" }}
      >
        <Image
          src={url}
          layout="fill"
          objectFit="contain"
          alt={raw.filename || ""}
        />
      </div>
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
    return <AudioPlayer url={url} />;
  } else {
    return null;
  }
}
