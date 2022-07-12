import { Client } from "@twilio/conversations";
import { createContext, useEffect, useState } from "react";
import { useTwilioConfig } from "../hooks/useTwilioConfig";

export const TwilioContext = createContext<TwilioContext>({
  client: null,
  setClient: (client: Client) => {},
} as TwilioContext);

export default function TwilioClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<Client | null>(null);
  const { config } = useTwilioConfig();

  useEffect(() => {
    if (config.accessToken) {
      const client = new Client(config.accessToken);
      setClient(client);
    }
  }, [config.accessToken]);

  return (
    <TwilioContext.Provider value={{ client, setClient }}>
      {children}
    </TwilioContext.Provider>
  );
}

type TwilioContext = {
  client: Client | null;
  setClient: (client: Client) => void;
};
