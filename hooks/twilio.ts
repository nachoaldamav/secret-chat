import { useContext } from "react";
import { TwilioContext } from "../context/twilioClient";

export default function useTwilio() {
  const { client, setClient } = useContext(TwilioContext);

  return { client, setClient };
}
