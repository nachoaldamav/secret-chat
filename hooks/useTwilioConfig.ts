import { useContext } from "react";
import { TwilioContext } from "../context/twilioConfig";

export const useTwilioConfig = () => {
  const { config } = useContext(TwilioContext);
  return {
    config,
  };
};
