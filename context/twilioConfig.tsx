import { createContext, useEffect, useState } from "react";
import { nhost } from "../libs/nhost";

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

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = async () => {
      console.log("Running twilio auth");
      nhost.auth.isAuthenticatedAsync().then((isAuthenticated) => {
        setIsAuthenticated(isAuthenticated);
      });
    };
    auth();
  }, []);

  useEffect(() => {
    const currentDate = new Date().getTime();

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
            expirationDate: currentDate + res.ttl * 1000,
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

    const nhostToken = nhost.auth.getAccessToken();

    const local: string = localStorage.getItem("twilio_accessToken") || "{}";
    const { accessToken, expirationDate } = JSON.parse(local) || {};

    if (accessToken) {
      setConfig({
        accessToken,
        expirationDate,
      });
    }

    if (nhostToken) {
      // Fetch token if it's expired
      if (currentDate > expirationDate) {
        fetchToken(nhostToken);
      }

      // Fetch if there is no token
      if (!accessToken) {
        fetchToken(nhostToken);
      }
    }
  }, [isAuthenticated]);

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
