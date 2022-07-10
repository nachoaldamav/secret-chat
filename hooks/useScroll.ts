import { useContext } from "react";
import { userScroll } from "../context/userScroll";

export default function useScroll() {
  const { scroll, container, setScroll, setContainer } = useContext(userScroll);
  return {
    scroll,
    container,
    setScroll,
    setContainer,
  };
}
