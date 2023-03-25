import { type NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import SharedHead from "@/features/UI/head";
import { Panel } from "@/features/UI/panel";
import LoginWithDiscord from "@/features/UI/buttons/login-with-discord";
import { useCallback, useEffect, useState } from "react";
import client from "@/graphql/apollo/client";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";
import { User } from "@/features/admin/users/users-list-item";
import { Account } from "@/pages/api/add-account";
import { getUserDiscordAccount } from "@/utils/user";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import dynamic from "next/dynamic";
import { ADD_WALLET } from "@/graphql/mutations/add-wallet";
import { ADD_USER } from "@/graphql/mutations/add-user";
import axios from "axios";
import { useLazyQuery } from "@apollo/client";

export type Wallet = {
  address: string;
  id: string;
  user?: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
  };
};

const Home: NextPage = () => {
  const WalletButton = dynamic(
    () => import("@/features/UI/buttons/wallet-button"),
    {
      ssr: false,
    }
  );
  const { publicKey } = useWallet();
  const [userFetched, setUserFetched] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [discordAccount, setDiscordAccount] = useState<Account | null>(null);

  const [fetchUser, { refetch }] = useLazyQuery(GET_USER_BY_WALLET_ADDRESS, {
    variables: { address: publicKey?.toString() },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setUserFetched(true);
      const user = data?.sodead_users?.[0];
      console.log({ data });
      if (user?.id) {
        setUser(user);
      } else {
        setUser(null);
        addUser();
      }
    },
  });

  const addUser = useCallback(async () => {
    const { data: newUser } = await axios.post("/api/add-user", {
      walletAddress: publicKey?.toString(),
    });

    console.log({ newUser });

    refetch();
  }, [publicKey, refetch]);

  useEffect(() => {
    if (!publicKey) return;
    if (!user && !userFetched) fetchUser();
    if (user) setDiscordAccount(getUserDiscordAccount(user));
  }, [fetchUser, user, userFetched, publicKey]);

  return (
    <>
      <SharedHead />
      <Panel className="flex flex-col items-center px-16">
        <>
          {!!user?.imageUrl ? (
            <ImageWithFallback
              className="rounded-2xl bg-stone-900 p-2 mb-12"
              src={user.imageUrl}
              alt="SoDead Logo"
              width={120}
              height={120}
            />
          ) : (
            <ImageWithFallback
              className="rounded-2xl bg-stone-900 p-2 mb-12"
              src="/images/sodead-logo.png"
              alt="SoDead Logo"
              width={120}
              height={120}
            />
          )}
          {!user?.primaryWallet?.address ? (
            <div className="text-center mb-4">
              <WalletButton />
            </div>
          ) : (
            <>
              <div className="flex w-full justify-between text-xl mb-2">
                <div className="w-1/3">Name:</div>
                <div className="w-2/3 truncate">{user.name}</div>
              </div>
              <div className="flex w-full justify-between text-xl mb-2">
                <div>Wallet:</div>
                {getAbbreviatedAddress(user.primaryWallet.address)}
              </div>
              {!!user.email && (
                <div className="flex w-full justify-between text-xl mb-2">
                  <div>Email:</div>
                  <div className="w-2/3 truncate">{user.email}</div>
                </div>
              )}
            </>
          )}

          <div>{!!user && <>USER: {JSON.stringify(user)}</>}</div>
          {!!userFetched && user && !discordAccount && (
            <div className="text-center">
              <LoginWithDiscord user={user} />
            </div>
          )}
          {/* {!!discordAccount && (
            <div className="items-center flex flex-col">
              <ImageWithFallback
                className="rounded-2xl bg-stone-900 p-2 mb-8"
                src={discordAccount.imageUrl}
                alt="SoDead Logo"
                width={120}
                height={120}
              />
              <div className="text-lg">{discordAccount.username}</div>
            </div>
          )} */}
        </>
      </Panel>
    </>
  );
};

export default Home;
