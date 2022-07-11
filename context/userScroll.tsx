import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export const userScroll = createContext<userScroll>({
  scroll: true,
  container: null,
  setScroll: () => {},
  setContainer: () => {},
} as userScroll);

type userScroll = {
  scroll: boolean;
  container: HTMLElement | null;
  setScroll: (scroll: boolean) => void;
  setContainer: (container: HTMLDivElement | null) => void;
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
    window.addEventListener("load", () => {
      const container = document.getElementById("messages");
      if (container) {
        setContainer(container as HTMLDivElement);
      } else {
        console.error("container not found");
      }
    });
  }, []);

  useEffect(() => {
    const options = {
      root: (document && document?.body) || null,
      rootMargin: "200px",
      threshold: 1.0,
    };

    if (container) {
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
    <userScroll.Provider value={{ scroll, container, setContainer, setScroll }}>
      {children}
    </userScroll.Provider>
  );
};

type Props = {
  children: React.ReactNode;
};
