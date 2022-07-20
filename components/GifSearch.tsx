/* eslint-disable @next/next/no-img-element */
import { Conversation } from "@twilio/conversations";
import { useEffect, useState } from "react";
import gf from "../libs/giphy";
import type { IGif } from "@giphy/js-types";
import Image from "next/image";
import cn from "clsx";
import { motion } from "framer-motion";

export default function GifSearch({
  onClick,
  conversation,
}: {
  onClick: () => void;
  conversation: Conversation;
}) {
  const [q, setQ] = useState("");
  const [gifs, setGifs] = useState<IGif[] | null>(null);
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
    <motion.div
      className="absolute top-0 pb-10 left-0 w-full h-full flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0 } }}
      exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.5 } }}
    >
      <span
        className="absolute inset-0 w-full h-full cursor-pointer z-[9999] bg-black bg-opacity-50 rounded-xl"
        onClick={onClick}
      />
      <motion.div
        className="absolute flex flex-col bottom-0 left-0 mx-auto p-4 z-[999999] rounded-xl w-full h-3/4 bg-gray-900"
        initial={{
          opacity: 1,
          y: 400,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      >
        <div className="flex flex-col items-center justify-start h-1/5">
          <h1 className="text-center text-2xl font-bold">Buscar GIF</h1>
          <input
            className="w-full p-2 rounded-lg border-2 border-gray-300 bg-transparent"
            type="text"
            placeholder="Buscar GIF"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {error && <div className="text-center text-red-600">{error}</div>}
        </div>
        <div className="flex flex-col items-start justify-start h-4/5 overflow-y-auto md:scrollbar-hide mt-2">
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
      </motion.div>
    </motion.div>
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
