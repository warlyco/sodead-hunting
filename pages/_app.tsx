import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";

import "@/styles/globals.css";
import MainLayout from "@/layouts/main";
import { ContextProvider } from "@/providers/context-provider";
import { FocuGuard } from "@/features/focu-guard";

const strangeDreams = localFont({
  src: "../fonts/strange-dreams.ttf",
  variable: "--font-strange-dreams",
});

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ContextProvider>
        <FocuGuard />
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </ContextProvider>
    </SessionProvider>
  );
};

export default App;
