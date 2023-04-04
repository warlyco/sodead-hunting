import { type AppType } from "next/app";
import { type Session } from "next-auth";
// import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
import NextNProgress from "nextjs-progressbar";
import "@/styles/globals.css";
import MainLayout from "@/layouts/main";
import { ContextProvider } from "@/providers/context-provider";
import { FoucGuard } from "@/features/fouc-guard";
import { AdminProvider } from "@/hooks/admin";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserProvider } from "@/hooks/user";
import SharedHead from "@/features/UI/head";
import { DebugModeProvider } from "@/hooks/debug-mode";

const strangeDream = localFont({
  src: "../public/fonts/strange-dreams.ttf",
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
        <style jsx global>{`
          :root {
            /* ... */
            --font-strange-dreams: ${strangeDream.style.fontFamily};
          }
        `}</style>
        <DebugModeProvider>
          <AdminProvider>
            <UserProvider>
              <FoucGuard />
              <MainLayout centered={isCentered}>
                <NextNProgress color="#b90811" />
                <SharedHead />
                <Component {...pageProps} />
              </MainLayout>
            </UserProvider>
          </AdminProvider>
        </DebugModeProvider>
      </ContextProvider>
    )
    // </SessionProvider>
  );
};

export default App;
