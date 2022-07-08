import { useContext } from "react";
import { userScroll } from "../context/userScroll";

export default function useScroll() {
  const { scroll, setScroll } = useContext(userScroll);
  return {
    scroll,
    setScroll,
  };
}
