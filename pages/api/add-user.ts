// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";
import { ADD_USER } from "@/graphql/mutations/add-user";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import { Wallet } from "@/pages/me";
import { client } from "@/graphql/backend-client";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { User } from "@/features/admin/users/users-list-item";
import { BIND_WALLET_TO_USER } from "@/graphql/mutations/bind-wallet-to-user";
import { NoopResponse, UserAndAccountResponse } from "@/pages/api/add-account";
import { logError } from "@/utils/log-error";

export type UserAndWalletResponse = {
  wallet: Wallet;
  user: User;
};

type Data =
  | UserAndWalletResponse
  | Wallet
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { walletAddress, discordUser, tokenType, accessToken, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "add-user",
    });

  if (!walletAddress || !discordUser || !tokenType || !accessToken) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  // check if wallet exists
  const { sodead_wallets }: { sodead_wallets: Wallet[] } = await client.request(
    {
      document: GET_WALLET_BY_ADDRESS,
      variables: { address: walletAddress },
    }
  );

  const existingWallet = sodead_wallets?.[0];

  console.log("if wallet has a user and an account, user is created");

  if (existingWallet?.user?.id && existingWallet?.user?.accounts?.length) {
    res.status(200).json(existingWallet);
    return;
  }

  // create user entry
  let wallet: Wallet = existingWallet;
  const {
    insert_sodead_users_one: newUser,
  }: { insert_sodead_users_one: User } = await client.request({
    document: ADD_USER,
    variables: {
      name: walletAddress,
    },
  });

  // create wallet entry
  if (!wallet) {
    try {
      const { data: newWallet }: { data: Wallet } = await axios.post(
        `${BASE_URL}/api/add-wallet`,
        {
          address: walletAddress,
          userId: newUser.id,
        }
      );
      wallet = newWallet;
    } catch (e) {
      axios.post(`${BASE_URL}/api/remove-user`, { id: newUser.id });
      return res.status(500).json({ error: "Error creating wallet" });
    }
  }

  // bind wallet to user
  try {
    const {
      update_sodead_wallets_by_pk,
    }: { update_sodead_wallets_by_pk: Wallet } = await client.request({
      document: BIND_WALLET_TO_USER,
      variables: {
        walletId: wallet.id,
        userId: newUser.id,
      },
    });
  } catch (error) {
    try {
      axios.post(`${BASE_URL}/api/remove-user`, { id: newUser.id });
    } catch (error) {
      return res.status(500).json({ error: "Error binding wallet to user" });
    }
  }

  // create account entry
  try {
    const { data: userAndAccount }: { data: UserAndAccountResponse } =
      await axios.post(`${BASE_URL}/api/add-account`, {
        imageUrl: discordUser?.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser?.id}/${discordUser?.avatar}.png`
          : "",
        email: discordUser?.email || "",
        providerId: "eea4c92e-4ac4-4203-8c19-cba7f7b8d4f6", // Discord
        providerAccountId: discordUser?.id || "",
        username: `${discordUser?.username}#${discordUser?.discriminator}`,
        userId: newUser.id,
        accessToken,
        tokenType,
        walletAddress,
      });

    res.status(200).json({ wallet, user: userAndAccount?.user });
  } catch (error: any) {
    try {
      axios.post(`${BASE_URL}/api/remove-user`, { id: newUser.id });
    } catch (error) {
      return res.status(500).json({ error: "Error adding Discord account" });
    }

    let returnMessage = "Error adding account";

    if (
      error?.response?.data?.error?.response?.errors?.[0]?.message?.includes(
        "Uniqueness violation"
      )
    ) {
      returnMessage = "Wallet bound to another discord account";
    }

    return res.status(500).json({ error: returnMessage });
  }
}
