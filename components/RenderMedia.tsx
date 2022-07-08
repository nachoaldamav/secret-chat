import { Media } from "@twilio/conversations";
import Image from "next/image";
import { useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";

export default function RenderMedia({
  media,
  id,
}: {
  media: Media[];
  id: string;
}) {
  const [targetElement, setTargetElement] = useState<HTMLDivElement | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);

  function callback(
    entries: any[],
    observer: { unobserve: (arg0: any) => void }
  ) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });
  }
  const raw = media[0];
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const el = document.getElementById(`message-${id}`);
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
    } else {
      console.log("No target element");
    }
    return () => {
      if (targetElement) observer.unobserve(targetElement as Element);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetElement]);

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
    return <AudioPlayer url={url} />;
  } else {
    return null;
  }
}
