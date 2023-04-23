import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import showToast from "@/features/toasts/show-toast";
import Spinner from "@/features/UI/spinner";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/user";
import { useLazyQuery } from "@apollo/client";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";
import { UserAndWalletResponse } from "@/pages/api/add-user";

export type DiscordUser = {
  accent_color: number | null;
  avatar: string | null;
  avatar_decoration: string | null;
  banner: string | null;
  banner_color: string | null;
  discriminator: string;
  display_name: string | null;
  email: string | null;
  flags: number;
  global_name: string | null;
  id: string;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  public_flags: number;
  username: string;
  verified: boolean;
};

const DiscordRedirect = () => {
  const { user, setUser } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [fetchUser] = useLazyQuery(GET_USER_BY_WALLET_ADDRESS, {
    variables: { address: publicKey?.toString() },
    fetchPolicy: "no-cache",
    onCompleted: ({ sodead_users }) => {
      const user = sodead_users?.[0];
      if (user) setUser(user);
    },
  });

  const saveUser = useCallback(
    async ({
      accessToken,
      tokenType,
    }: {
      accessToken: string;
      tokenType: string;
    }) => {
      if (isSaving) return;
      setIsSaving(true);

      console.log("1: checking if user exists");
      await fetchUser();
      if (user) return;

      const walletAddress = localStorage.getItem("walletAddress");
      console.log("2: user does not exist, save", { walletAddress });
      localStorage.removeItem("walletAddress");

      if (!walletAddress) {
        // showToast({
        //   primaryMessage: "There was an error saving your user info",
        // });
        // router.push("/");
        return;
      }

      // fetch discord user info
      console.log("looking up discord user info");
      const { data: discordUser } = await axios.get(
        `https://discord.com/api/users/@me`,
        {
          headers: {
            authorization: `${tokenType} ${accessToken}`,
          },
        }
      );

      console.log("discord user info", { discordUser });

      try {
        console.log("5: creating user", { walletAddress });
        const { data }: { data: UserAndWalletResponse } = await axios.post(
          "/api/add-user",
          {
            walletAddress,
            discordUser: {
              ...discordUser,
            },
            tokenType,
            accessToken,
          }
        );
        setUser(data?.user);
        showToast({
          primaryMessage: "Registration Successful",
        });
        setTimeout(() => {
          router.push("/hunt/active");
        }, 500);
      } catch (error: any) {
        console.error({ error });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, publicKey, router, tokenType]
  );

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [
      fragment.get("access_token"),
      fragment.get("token_type"),
    ];
    if (!accessToken || !tokenType) {
      router.push("/");
      return;
    }
    setAccessToken(accessToken);
    setTokenType(tokenType);
    saveUser({ accessToken, tokenType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="flex flex-col text-4xl mt-48 items-center justify-center space-x-4 font-strange-dreams tracking-wider">
        <div className="mb-8">Saving User Info</div>
        <Spinner />
      </div>
    </div>
  );
};

export default DiscordRedirect;
