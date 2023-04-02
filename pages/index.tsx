import { type NextPage } from "next";
import Head from "next/head";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "@/hooks/user";
import { ActiveLootboxes } from "@/features/loot-boxes/active-loot-boxes";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";

const Home: NextPage = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();

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
      <div className="container flex flex-col items-center justify-center gap-6 text-stone-300">
        {publicKey && user?.accounts?.length ? (
          <div className="overflow-y-auto pt-16 mb-16 text-center">
            <ActiveLootboxes />
          </div>
        ) : (
          <UserWithoutAccountBlocker />
        )}
      </div>
    </>
  );
};

export default Home;
