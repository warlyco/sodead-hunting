import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import Spinner from "@/features/UI/spinner";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export type DiscordUser = {
  accent_color: string;
  avatar: string;
  avatar_decoration: string;
  banner: string;
  banner_color: string;
  discriminator: string;
  flags: number;
  id: string;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  public_flags: number;
  username: string;
};

type Response = {
  id: string;
};

const DiscordRedirect = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const router = useRouter();

  const saveUser = useCallback(
    async (user: any) => {
      if (!user) return;

      if (!publicKey) {
        console.error("No public key found");
        return;
      }

      try {
        const res = await axios.post(`${BASE_URL}/api/update-user-discord`, {
          walletAddress: publicKey,
          discordId: user.id,
          discordName: user.username,
          discordAvatarUrl: user?.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : null,
        });

        if (res.data) {
          showToast({
            primaryMessage: "Discord info saved!",
          });
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
            primaryMessage: "This Discord account is linked to another wallet",
          });
          router.push("/");
        }
      }
    },
    [publicKey, router]
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
    fetchDiscordUser({ accessToken, tokenType });
  }, [discordUser, fetchDiscordUser, router]);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="flex flex-col text-4xl mt-48 items-center justify-center space-x-4">
        <div className="mb-8">Saving User Info</div>
        <Spinner />
      </div>
    </div>
  );
};

export default DiscordRedirect;
