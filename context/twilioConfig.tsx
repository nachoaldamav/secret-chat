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
    } else if (
      (nhostToken && userId) ||
      (!accessToken && nhostToken) ||
      currentDate > expirationDate
    ) {
      console.log("Fetching new token", nhostToken, userId);
      fetch("/api/get-token", {
        headers: {
          Authorization: `Bearer ${nhostToken}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const rawConfig = {
            accessToken: res.token,
            expirationDate: new Date().getTime() + res.ttl,
          };
          setConfig(rawConfig);
          localStorage.setItem("twilio_accessToken", JSON.stringify(rawConfig));
        })
        .catch((err) => {
          console.error(err);
          console.log("Nhost access token", nhostToken);
        });
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
