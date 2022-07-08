import "../styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "../components/AppLayout";
import { ThemeProvider } from "next-themes";
import { NhostNextProvider } from "@nhost/nextjs";
import { NhostApolloProvider } from "@nhost/react-apollo";
import { nhost } from "../libs/nhost";
import { TwilioProvider } from "../context/twilioConfig";
import { UserScrollProvider } from "../context/userScroll";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NhostNextProvider nhost={nhost} initial={pageProps.nhostSession}>
      <NhostApolloProvider nhost={nhost}>
        <ThemeProvider
          storageKey="color-theme"
          forcedTheme={"dark"}
          attribute="class"
        >
          <TwilioProvider>
            <AppLayout>
              <UserScrollProvider>
                <Component {...pageProps} />
              </UserScrollProvider>
            </AppLayout>
          </TwilioProvider>
        </ThemeProvider>
      </NhostApolloProvider>
    </NhostNextProvider>
  );
}

export default MyApp;
