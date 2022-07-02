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

const NON_PROTECTED_ROUTES = ["/", "/login", "/signup"];

const ROUTES = [
  {
    path: "/home",
    title: "Inicio",
    icon: <HomeIcon className="h-8 w-8" />,
  },
  {
    path: "/contacts",
    title: "Contactos",
    icon: <UserGroupIcon className="h-8 w-8" />,
  },
  {
    path: "/call",
    title: "Llamar",
    icon: <PhoneIcon className="h-8 w-8" />,
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
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-start justify-center h-fit bg-gray-200 text-black dark:bg-secondary dark:text-white font-display sm:p-4 max-h-screen">
      <div className="flex flex-col w-full max-w-md mx-auto bg-primaryLight dark:bg-primary h-screen sm:rounded-xl py-4 px-3 relative">
        {NON_PROTECTED_ROUTES.includes(pathname) && (
          <span className="absolute top-0 right-0 mr-4 mb-4 z-[999]">
            <button
              className="bg-primaryLight dark:bg-primary text-black dark:text-white rounded-lg p-2 border-gray-600 border-2 my-2 "
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "light" ? (
                <MoonIcon className="h-6 w-6" />
              ) : (
                <SunIcon className="h-6 w-6" />
              )}
            </button>
          </span>
        )}
        {children}
        {!NON_PROTECTED_ROUTES.includes(pathname) && (
          <div className="flex flex-row items-center absolute bottom-0 left-0 px-2 py-6 justify-evenly w-full bg-gray-200 dark:bg-gray-800 rounded-t-3xl sm:rounded-b-xl h-fit">
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
