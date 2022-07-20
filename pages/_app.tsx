import "../styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "../components/AppLayout";
import { ThemeProvider } from "next-themes";
import { NhostNextProvider } from "@nhost/nextjs";
import { NhostApolloProvider } from "@nhost/react-apollo";
import { nhost } from "../libs/nhost";
import { TwilioProvider } from "../context/twilioConfig";
import { UserScrollProvider } from "../context/userScroll";
import TwilioClientProvider from "../context/twilioClient";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TwilioProvider>
      <NhostNextProvider nhost={nhost} initial={pageProps.nhostSession}>
        <NhostApolloProvider nhost={nhost}>
          <UserScrollProvider>
            <ThemeProvider
              storageKey="color-theme"
              forcedTheme={"dark"}
              attribute="class"
            >
              <AppLayout>
                <Head>
                  <title>Secret Chat</title>
                </Head>
                <TwilioClientProvider>
                  <Component {...pageProps} />
                </TwilioClientProvider>
              </AppLayout>
            </ThemeProvider>
          </UserScrollProvider>
        </NhostApolloProvider>
      </NhostNextProvider>
    </TwilioProvider>
  );
}

export default MyApp;
