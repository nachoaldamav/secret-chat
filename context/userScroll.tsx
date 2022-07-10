import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export const userScroll = createContext<userScroll>({
  scroll: true,
  setScroll: () => {},
} as userScroll);

type userScroll = {
  scroll: boolean;
  setScroll: (scroll: boolean) => void;
};

export const UserScrollProvider = ({ children }: Props) => {
  const router = useRouter();
  const { room } = router.query;
  const [scroll, setScroll] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  function callback(
    entries: any[],
    observer: { unobserve: (arg0: any) => void }
  ) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setScroll(false);
      } else {
        setScroll(true);
      }
    });
  }

  useEffect(() => {
    const container = document.getElementById("messages");
    if (container) {
      setContainer(container as HTMLDivElement);
    }
  }, []);

  useEffect(() => {
    const options = {
      root: (document && document?.body) || null,
      rootMargin: "10px",
      threshold: 0,
    };
    if (container) {
      console.log("Running state");
      const el = document.getElementById("scroll-anchor");
      if (el) {
        const observer = new IntersectionObserver(callback, options);
        observer.observe(el as Element);
        return () => {
          observer.unobserve(el as Element);
        };
      }
    }
  }, [container, room, router.pathname]);

  return (
    <userScroll.Provider value={{ scroll, setScroll }}>
      {children}
    </userScroll.Provider>
  );
};

type Props = {
  children: React.ReactNode;
};
