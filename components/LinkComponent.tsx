import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useScroll from "../hooks/useScroll";

function scrollToBottom() {
  setTimeout(() => {
    const container = document.getElementById("messages");
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }, 0);
}

export default function Links({ url }: { url: string }) {
  const { scroll } = useScroll();

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
        if (!scroll) scrollToBottom();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlWithoutQueryString]);

  if (!data?.title || !data.description || !data.image) {
    return null;
  }

  return (
    <Link href={url}>
      <a
        className="flex flex-col h-fit w-full gap-2 border mt-2 border-white rounded-xl"
        style={{
          maxWidth: "65%",
        }}
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
