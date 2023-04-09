import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import Spinner from "@/features/UI/spinner";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/user";
import { useLazyQuery } from "@apollo/client";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";

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

  const [fetchUser] = useLazyQuery(GET_USER_BY_WALLET_ADDRESS, {
    variables: { address: publicKey?.toString() },
    fetchPolicy: "no-cache",
    onCompleted: ({ sodead_users }) => {
      const user = sodead_users?.[0];
      if (user) setUser(user);
    },
  });

  const saveUser = useCallback(
    async (user: DiscordUser) => {
      const savedUserId = localStorage.getItem("userId");
      if (!user) return;

      if (!publicKey) {
        console.error("No public key found");
        return;
      }

      console.log("saving user", { user });

      try {
        const res = await axios.post(`${BASE_URL}/api/add-account`, {
          imageUrl: user?.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : null,
          email: user.email,
          providerId: "eea4c92e-4ac4-4203-8c19-cba7f7b8d4f6", // Discord
          providerAccountId: user.id,
          username: `${user.username}#${user.discriminator}`,
          userId: savedUserId,
          walletAddress: publicKey,
          accessToken,
          tokenType,
        });

        if (res.data) {
          showToast({
            primaryMessage: "Discord info saved!",
          });
          await fetchUser();
          router.push("/me");
        } else {
          showToast({
            primaryMessage: "Unable to save Discord info",
          });
          router.push("/");
        }
      } catch (error: any) {
        console.error(error);
        const { message } = error.response.data.error.response.errors[0];
        if (message.includes("Uniqueness violation")) {
          showToast({
            primaryMessage: "This Discord account is linked to another user",
          });
          router.push("/");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, publicKey, router, tokenType]
  );

  const fetchDiscordUser = useCallback(
    async ({
      accessToken,
      tokenType,
    }: {
      accessToken: string;
      tokenType: string;
    }) => {
      try {
        const { data: user } = await axios.get(
          `https://discord.com/api/users/@me`,
          {
            headers: {
              authorization: `${tokenType} ${accessToken}`,
            },
          }
        );

        saveUser(user);
      } catch (error: any) {
        setError(error.message);
      }
    },
    [saveUser]
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
    fetchDiscordUser({ accessToken, tokenType });
  }, [fetchDiscordUser, router]);

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
