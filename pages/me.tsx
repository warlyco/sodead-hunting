import { type NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import SharedHead from "@/features/UI/head";
import { Panel } from "@/features/UI/panel";
import LoginWithDiscord from "@/features/UI/buttons/login-with-discord";
import { useEffect, useState } from "react";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";
import { User } from "@/features/admin/users/users-list-item";
import { Account } from "@/pages/api/add-account";
import { getUserDiscordAccount } from "@/utils/user";
import dynamic from "next/dynamic";
import { useLazyQuery } from "@apollo/client";
import { useUser } from "@/hooks/user";

export type Wallet = {
  address: string;
  id: string;
  user: User;
};

const Home: NextPage = () => {
  const WalletButton = dynamic(
    () => import("@/features/UI/buttons/wallet-button"),
    {
      ssr: false,
    }
  );
  const { user, setUser } = useUser();
  const { publicKey } = useWallet();
  const [userFetched, setUserFetched] = useState(false);
  const [discordAccount, setDiscordAccount] = useState<
    Account | undefined | null
  >(undefined);

  const [fetchUser, { refetch }] = useLazyQuery(GET_USER_BY_WALLET_ADDRESS, {
    variables: { address: publicKey?.toString() },
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      setUserFetched(true);
      const user = data?.sodead_users?.[0];
      console.log({ data });
      if (user?.id) {
        setUser(user);
      } else {
        setUser(null);
      }
    },
  });

  useEffect(() => {
    if (!publicKey) return;
    if (!user && !userFetched) fetchUser();
  }, [fetchUser, user, userFetched, publicKey]);

  useEffect(() => {
    if (user) setDiscordAccount(getUserDiscordAccount(user));
  }, [user]);

  return (
    <>
      <SharedHead />
      <Panel className="flex flex-col items-center px-16">
        <>
          {!!user?.imageUrl || !!discordAccount?.imageUrl ? (
            <ImageWithFallback
              className="rounded-2xl bg-stone-900 p-2 mb-8 mt-4"
              src={user?.imageUrl || discordAccount?.imageUrl}
              alt="SoDead Logo"
              width={200}
              height={200}
            />
          ) : (
            <ImageWithFallback
              className="rounded-2xl bg-stone-900 p-2 mb-8 mt-4"
              src="/images/sodead-logo.png"
              alt="SoDead Logo"
              width={200}
              height={200}
            />
          )}

          {!!user && !user?.accounts?.[0] ? (
            <>
              <div className="flex w-full justify-between text-xl mb-2">
                <div className="w-1/3">Name:</div>
                <div className="w-2/3 truncate text-right">{user.name}</div>
              </div>
              <div className="flex w-full justify-between text-xl mb-2">
                <div>Wallet:</div>
                {getAbbreviatedAddress(user.primaryWallet.address)}
              </div>
              {!!user.email ||
                (!!discordAccount?.email && (
                  <div className="flex w-full justify-between text-xl mb-2">
                    <div>Email:</div>
                    <div className="w-2/3 truncate text-right">
                      {user?.email || discordAccount?.email}
                    </div>
                  </div>
                ))}
            </>
          ) : (
            <>
              {!!publicKey ? (
                <div className="text-center py-4">
                  <LoginWithDiscord user={user || undefined} />
                </div>
              ) : (
                <div className="text-center mb-4">
                  <WalletButton />
                </div>
              )}
            </>
          )}
        </>
      </Panel>
    </>
  );
};

export default Home;
