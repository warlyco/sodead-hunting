import { type AppType } from "next/app";
import { type Session } from "next-auth";
// import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";

import "@/styles/globals.css";
import MainLayout from "@/layouts/main";
import { ContextProvider } from "@/providers/context-provider";
import { FoucGuard } from "@/features/fouc-guard";
import { AdminProvider } from "@/hooks/admin";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserProvider } from "@/hooks/user";

const strangeDream = localFont({
  src: "../fonts/strange-dreams.ttf",
  variable: "--font-strange-dreams",
});

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const [isCentered, setIsCentered] = useState(false);
  return (
    useEffect(() => {
      if (router.pathname === "/" || router.pathname === "/me") {
        setIsCentered(true);
      } else {
        setIsCentered(false);
      }
    }, [router, router.pathname, setIsCentered]),
    (
      // <SessionProvider session={session}>
      <ContextProvider>
        <AdminProvider>
          <UserProvider>
            <FoucGuard />
            <MainLayout centered={isCentered}>
              <Component {...pageProps} />
            </MainLayout>
          </UserProvider>
        </AdminProvider>
      </ContextProvider>
    )
    // </SessionProvider>
  );
};

export default App;
