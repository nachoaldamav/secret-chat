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
                  <link
                    rel="icon"
                    href="/images/logo.png"
                    type="image/png"
                    sizes="1080x1080"
                  />
                  <meta property="og:title" content="Secret Chat" />
                  <meta property="og:site_name" content="Secret Chat" />
                  <meta
                    property="og:url"
                    content="https://secret-chat-one.vercel.app/"
                  />
                  <meta
                    property="og:description"
                    content="¡App para chatear con cualquier persona!"
                  />
                  <meta property="og:type" content="website" />
                  <meta
                    property="og:image"
                    content="https://secret-chat-one.vercel.app/images/og-image.jpg"
                  />
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
