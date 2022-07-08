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
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const el = document.getElementById("messages");
    if (el) {
      el.addEventListener("scroll", () => {
        if (el.scrollTop >= el.scrollHeight - el.offsetHeight) {
          setScroll(false);
        } else {
          setScroll(true);
        }
      });
    } else {
      console.log("No element found");
    }

    return () => {
      if (el) {
        el.removeEventListener("scroll", () => {});
      }
    };
  }, []);

  return (
    <userScroll.Provider value={{ scroll, setScroll }}>
      {children}
    </userScroll.Provider>
  );
};
