import "../styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "../components/AppLayout";
import { ThemeProvider } from "next-themes";
import { NhostNextProvider } from "@nhost/nextjs";
import { NhostApolloProvider } from "@nhost/react-apollo";
import { nhost } from "../libs/nhost";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NhostNextProvider nhost={nhost} initial={pageProps.nhostSession}>
      <NhostApolloProvider nhost={nhost}>
        <ThemeProvider
          storageKey="color-theme"
          /* @ts-ignore-next-line */
          forcedTheme={Component.theme}
          attribute="class"
        >
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </ThemeProvider>
      </NhostApolloProvider>
    </NhostNextProvider>
  );
}

export default MyApp;
