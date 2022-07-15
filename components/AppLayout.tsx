import { useTheme } from "next-themes";
import {
  CogIcon,
  HomeIcon,
  MoonIcon,
  PhoneIcon,
  SunIcon,
  UserGroupIcon,
} from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import getUserId from "../queries/getUserId";
import { nhost } from "../libs/nhost";
import { gql } from "@apollo/client";
import { PlusIcon } from "@heroicons/react/outline";

const NON_PROTECTED_ROUTES = ["/", "/login", "/signup"];

const ROUTES = [
  {
    path: "/home",
    title: "Inicio",
    icon: <HomeIcon className="h-8 w-8" />,
  },
  {
    path: "/create",
    title: "Crear sala",
    icon: <PlusIcon className="h-8 w-8" />,
  },
  {
    path: "/settings",
    title: "Ajustes",
    icon: <CogIcon className="h-8 w-8" />,
  },
];

export default function AppLayout({ children }: any) {
  const router = useRouter();
  const { pathname } = router;

  const hasFooter =
    !NON_PROTECTED_ROUTES.includes(pathname) && pathname !== "/chat/[room]";

  return (
    <div className="w-full min-h-screen flex flex-col items-start justify-center h-fit bg-gray-200 text-black dark:bg-secondary dark:text-white font-display sm:p-4 max-h-screen">
      <div className="flex flex-col w-full max-w-md mx-auto bg-primaryLight dark:bg-primary sm:max-h-[95vh] h-screen sm:rounded-xl relative">
        <div className="flex flex-col w-full h-[100%] justify-start items-center">
          {children}
        </div>
        {hasFooter && (
          <div className="flex flex-row items-center absolute bottom-0 left-0 px-2 py-6 justify-evenly w-full bg-gray-100 dark:bg-gray-800 rounded-t-2xl sm:rounded-b-xl h-fit">
            {ROUTES.map((route) => (
              <Link href={route.path} key={route.path}>
                <a
                  className={
                    pathname !== route.path
                      ? "flex flex-col gap-1 items-center justify-between transition duration-150 ease-in-out dark:hover:text-white opacity-50 hover:opacity-100"
                      : "flex flex-col gap-1 items-center justify-between dark:hover:text-white opacity-100"
                  }
                >
                  {route.icon}
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
