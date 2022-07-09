import { useContext } from "react";
import { TwilioContext } from "../context/twilioConfig";

export const useTwilioConfig = () => {
  const { config, setConfig } = useContext(TwilioContext);
  return {
    config,
    setConfig,
  };
};
