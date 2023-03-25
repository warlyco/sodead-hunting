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

export type Wallet = {
  address: string;
  id: string;
  user: {
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
  const [walletFetched, setWalletFetched] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [discordAccount, setDiscordAccount] = useState<Account | null>(null);
  const [storedWallet, setStoredWallet] = useState<Wallet | null>(null);

  const addWallet = useCallback(async () => {
    const { data: newWallet } = await axios.post("/api/add-wallet", {
      address: publicKey?.toString(),
    });

    console.log({ newWallet });

    setStoredWallet(newWallet);
  }, [publicKey]);

  const fetchWallet = useCallback(async () => {
    if (walletFetched || !publicKey) return;

    const { data: walletData } = await client.query({
      query: GET_WALLET_BY_ADDRESS,
      variables: { address: publicKey?.toString() },
      fetchPolicy: "network-only",
    });

    console.log({ walletData });

    setWalletFetched(true);
    const wallet = walletData?.sodead_wallets?.[0];

    if (wallet?.id) {
      setStoredWallet(wallet);
    } else {
      setStoredWallet(null);
      addWallet();
    }
  }, [publicKey, walletFetched, addWallet]);

  const addUser = useCallback(async () => {
    const { data: newUser } = await axios.post("/api/add-user", {
      walletAddress: publicKey?.toString(),
    });

    console.log({ newUser });

    setUser(newUser);
  }, [publicKey]);

  const fetchUser = useCallback(async () => {
    if (userFetched || !publicKey) return;

    const { data: usersData } = await client.query({
      query: GET_USER_BY_WALLET_ADDRESS,
      variables: { address: publicKey?.toString() },
      fetchPolicy: "network-only",
    });

    console.log({ usersData });

    setUserFetched(true);
    const user = usersData?.sodead_users?.[0];

    if (user?.id) {
      setUser(user);
    } else {
      setUser(null);
      addUser();
    }
  }, [addUser, publicKey, userFetched]);

  useEffect(() => {
    if (!publicKey) return;
    if (!storedWallet && !walletFetched) fetchWallet();
    if (storedWallet && !user && !userFetched) fetchUser();
    if (user) {
      const discordAccount = getUserDiscordAccount(user);
      setDiscordAccount(discordAccount);
    }
  }, [
    fetchUser,
    user,
    userFetched,
    publicKey,
    storedWallet,
    walletFetched,
    fetchWallet,
  ]);

  return (
    <>
      <SharedHead />
      <Panel className="flex flex-col items-center">
        <ImageWithFallback
          className="rounded-2xl bg-stone-900 p-2 mb-8"
          src="/images/sodead-logo.png"
          alt="SoDead Logo"
          width={120}
          height={120}
        />
        {!!publicKey ? (
          <>
            <div className="text-center text-2xl">
              🩸Connected to wallet: <br />{" "}
              {getAbbreviatedAddress(publicKey.toString())}🩸
              {!!storedWallet && (
                <>STORED: {getAbbreviatedAddress(storedWallet.address)}🩸</>
              )}
            </div>
            <div>{!!user && <>USER: {JSON.stringify(user)}</>}</div>
          </>
        ) : (
          <div className="text-center mb-4">
            <WalletButton />
          </div>
        )}
        {!!userFetched && user && !discordAccount && (
          <div className="text-center">
            <LoginWithDiscord user={user} />
          </div>
        )}
        {!!discordAccount && (
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
        )}
      </Panel>
    </>
  );
};

export default Home;
