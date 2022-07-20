/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function GiphyRender({ url }: { url: string }) {
  return (
    <Link href={url}>
      <a
        className="flex flex-col items-center justify-center relative"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className="rounded-lg h-auto w-full" src={url} alt="Giphy" />
        <img
          className="absolute top-0 left-0 m-2"
          style={{ width: "4rem" }}
          src="/images/giphy_logo.png"
          alt="Giphy"
        />
      </a>
    </Link>
  );
}
