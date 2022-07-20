/* eslint-disable @next/next/no-img-element */
import { Conversation } from "@twilio/conversations";
import { useEffect, useState } from "react";
import gf from "../libs/giphy";
import type { IGif } from "@giphy/js-types";
import Spinner from "./Spinner";
import Image from "next/image";
import cn from "clsx";

export default function GifSearch({
  onClick,
  conversation,
}: {
  onClick: () => void;
  conversation: Conversation;
}) {
  const [q, setQ] = useState("");
  const [gifs, setGifs] = useState<IGif[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (conversation) {
      gf.search(q, {
        rating: "pg-13",
      })
        .then((gifs) => {
          setGifs(gifs.data);
          setError("");
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [conversation, q]);

  return (
    <div className="absolute top-0 pb-10 left-0 w-full h-full flex flex-col items-center justify-center">
      <span
        className="absolute inset-0 w-full h-full cursor-pointer z-[9999] bg-black bg-opacity-50 rounded-xl"
        onClick={onClick}
      />
      <div className="absolute bottom-0 left-0 mx-auto p-4 z-[99999] rounded-xl w-full h-3/4 bg-gray-900">
        <h1 className="text-center text-2xl font-bold">Buscar GIF</h1>
        <input
          className="w-full p-2 rounded-lg border-2 border-gray-300 bg-transparent"
          type="text"
          placeholder="Buscar GIF"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {loading && (
          <div className="text-center">
            <Spinner />
          </div>
        )}
        {error && <div className="text-center text-red-600">{error}</div>}
        <div className="flex flex-col items-start justify-start h-96 overflow-y-auto md:scrollbar-hide mt-2">
          {gifs && (
            <div className="columns-2 [column-fill:_balance] box-border mx-auto before:box-inherit after:box-inherit">
              {gifs.map((gif) => (
                <GiphyImage
                  key={gif.id}
                  className="break-inside-avoid mb-6 rounded-lg cursor-pointer hover:scale-110"
                  height={gif.images.downsized_large.height}
                  width={gif.images.downsized_large.width}
                  src={gif.images.downsized_large.url}
                  alt={gif.title}
                  onClick={() => {
                    conversation.sendMessage(gif.images.original.webp);
                    onClick();
                  }}
                  unoptimized={true}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GiphyImage(props: any) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={props.alt}
      className={cn(
        props.className,
        "duration-500 ease-in-out",
        isLoading
          ? "grayscale blur-2xl scale-110"
          : "grayscale-0 blur-0 scale-100"
      )}
      onLoadingComplete={() => setIsLoading(false)}
    />
  );
}
