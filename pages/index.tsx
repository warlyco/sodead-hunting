import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";

const Home: NextPage = () => {
  const { publicKey } = useWallet();

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
        <ImageWithFallback
          src="/images/sodead-logo.png"
          alt="SoDead Logo"
          width={200}
          height={200}
        />
        {!!publicKey && (
          <>
            <div className="text-center text-2xl">
              🩸Connected to wallet: <br />{" "}
              {getAbbreviatedAddress(publicKey.toString())}🩸
            </div>
            <div></div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
