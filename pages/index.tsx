import { type NextPage } from "next";
import Head from "next/head";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "@/hooks/user";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import Image from "next/image";
import { useEffect, useState } from "react";
import Spinner from "@/features/UI/spinner";
import { useRouter } from "next/router";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";

const Home: NextPage = () => {
  const { publicKey } = useWallet();
  const { user, setUser } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    }
    if (user && !publicKey) {
      setUser(null);
    }
    if (publicKey && user?.accounts?.length) {
      router.push("/hunt/active");
    }
  });

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
        <ContentWrapper>
          {isLoaded ? (
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
          ) : (
            <ContentWrapperYAxisCenteredContent>
              <Spinner />
            </ContentWrapperYAxisCenteredContent>
          )}
        </ContentWrapper>
      </>
    </>
  );
};

export default Home;
