import { type NextPage } from "next";
import Head from "next/head";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "@/hooks/user";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import Image from "next/image";
import { useEffect } from "react";

const Home: NextPage = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();

  useEffect(
    () => {
      if (publicKey && user?.accounts?.length) {
        window.location.href = "/hunt/active";
      }
    }
  )

  return (
    <>
      <Head>
        <title>SoDead Hunting</title>
        <meta name="description" content="SoDead Hunting" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#b90811" />
        <meta name="theme-color" content="#000" />
      </Head>
      <>
        {publicKey && user?.accounts?.length ? (
          <Image
            className="h-64 w-64"
            src="/images/sodead-logo.png"
            alt="SoDead Logo"
            height={300}
            width={300}
          />
        ) : (
          <UserWithoutAccountBlocker />
        )}
      </>
    </>
  );
};

export default Home;
