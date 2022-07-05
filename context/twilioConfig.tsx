import { createContext, useEffect, useState } from "react";
import { nhost } from "../libs/nhost";
import getUserId from "../queries/getUserId";

export const TwilioContext = createContext<TwilioContext>({
  config: {
    accessToken: null,
    expirationDate: 0,
  },
  setConfig: () => {},
} as TwilioContext);

export const TwilioProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState({
    accessToken: null,
    expirationDate: 0,
  });

  async function fetchToken(nhostToken: string) {
    return await fetch("/api/get-token", {
      headers: {
        Authorization: `Bearer ${nhostToken}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const rawConfig = {
          accessToken: res.token,
          expirationDate: new Date().getTime() + res.ttl * 1000,
        };
        setConfig(rawConfig);
        localStorage.setItem("twilio_accessToken", JSON.stringify(rawConfig));
        return rawConfig;
      })
      .catch((err) => {
        console.error(err);
        console.log("Nhost access token", nhostToken);
        return null;
      });
  }

  useEffect(() => {
    const userId = getUserId();
    const nhostToken = nhost.auth.getAccessToken();
    const currentDate = new Date().getTime();

    const local: string = localStorage.getItem("twilio_accessToken") || "{}";
    const { accessToken, expirationDate } = JSON.parse(local) || {};

    if (accessToken) {
      setConfig({
        accessToken,
        expirationDate,
      });
    }

    console.log(currentDate > expirationDate);

    if (nhost && nhostToken) {
      // Fetch token if it's expired
      if (currentDate > expirationDate) {
        fetchToken(nhostToken);
      }

      // Fetch if there is no token
      if (!accessToken) {
        fetchToken(nhostToken);
      }
    } else {
      console.log("No nhost token");
    }
  }, []);

  return (
    <TwilioContext.Provider value={{ config }}>
      {children}
    </TwilioContext.Provider>
  );
};

type TwilioContext = {
  config: {
    accessToken: string | null;
    expirationDate: number;
  };
  setConfig?: (config: { accessToken: string; expirationDate: number }) => void;
};
