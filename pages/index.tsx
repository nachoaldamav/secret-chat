import { useUserData } from "@nhost/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import HomeImage from "../public/images/home.png";

function Home() {
  const router = useRouter();
  const user = useUserData();

  if (user) router.push("/home");

  return (
    <div className="flex flex-col items-start justify-start w-full h-full">
      <section className="h-3/5 w-full">
        <Image
          src={HomeImage}
          alt="Home"
          width={1200}
          height={1000}
          loading="eager"
          priority={true}
          placeholder="blur"
          className="z-10"
        />
      </section>
      <section className="h-2/5 w-full flex flex-col gap-3 justify-start items-center pb-10">
        <h1 className="text-xl text-center font-bold w-2/3">
          Conecta con tus amigos en cualquier parte del mundo.
        </h1>
        <h2 className="text-center font-medium text-secondaryLight dark:text-gray-300">
          Chatea con cualquier persona.
        </h2>
        <Link href="/login" as={"/login"}>
          <a className="w-3/4 mt-10 inline-flex items-center justify-center font-semibold text-xl text-white bg-blue-600 shadow-md  rounded-full py-4">
            Empezar
          </a>
        </Link>
      </section>
    </div>
  );
}

export default Home;
