import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

export const userScroll = createContext<userScroll>({
  scroll: true,
  setScroll: () => {},
} as userScroll);

type userScroll = {
  scroll: boolean;
  setScroll: (scroll: boolean) => void;
};

export const UserScrollProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementById("messages");
      if (el) {
        el.addEventListener("scroll", () => {
          // Add 100px buffer to prevent flicker
          if (el.scrollTop >= el.scrollHeight - el.offsetHeight - 50) {
            setScroll(false);
          } else {
            setScroll(true);
          }
        });
      } else {
        console.log("No element found");
      }

      return () => {
        el?.removeEventListener("scroll", () => {});
      };
    }, 1000);
  }, [router.pathname]);

  return (
    <userScroll.Provider value={{ scroll, setScroll }}>
      {children}
    </userScroll.Provider>
  );
};
