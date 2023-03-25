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

type UserAndWalletResponse = {
  wallet: Wallet;
  user: User;
};

type Data =
  | UserAndWalletResponse
  | Wallet
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const { sodead_wallets }: { sodead_wallets: Wallet[] } = await client.request(
    {
      document: GET_WALLET_BY_ADDRESS,
      variables: { address: walletAddress },
    }
  );

  const existingWallet = sodead_wallets?.[0];

  console.log("existingWallet", existingWallet);
  let wallet: Wallet = existingWallet;

  if (existingWallet?.user?.id) {
    res.status(200).json(existingWallet);
    return;
  }

  const {
    insert_sodead_users_one: newUser,
  }: { insert_sodead_users_one: User } = await client.request({
    document: ADD_USER,
    variables: {
      name: walletAddress,
    },
  });

  if (existingWallet) {
    const {
      update_sodead_wallets_by_pk: updatedWallet,
    }: { update_sodead_wallets_by_pk: Wallet } = await client.request({
      document: BIND_WALLET_TO_USER,
      variables: {
        walletId: existingWallet.id,
        userId: newUser.id,
      },
    });
    wallet = updatedWallet;
  } else {
    try {
      const { data: newWallet }: { data: Wallet } = await axios.post(
        `${BASE_URL}/api/add-wallet`,
        {
          address: walletAddress,
          userId: newUser.id,
        }
      );
      const {
        update_sodead_wallets_by_pk: updatedWallet,
      }: { update_sodead_wallets_by_pk: Wallet } = await client.request({
        document: BIND_WALLET_TO_USER,
        variables: {
          walletId: newWallet.id,
          userId: newUser.id,
        },
      });
      wallet = updatedWallet;
      console.log("updatedWallet", updatedWallet);

      if (!updatedWallet) {
        res.status(500).json({ error: "Error creating wallet" });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: "Adding wallet error" });
    }
  }

  // const {
  //   insert_sodead_users_one: newUser,
  // }: { insert_sodead_users_one: User } = await client.request({
  //   document: ADD_USER,
  //   variables: {
  //     name: walletAddress,
  //   },
  // });

  // console.log("insert_sodead_users_one", insert_sodead_users_one);
  res.status(200).json({
    wallet,
    user: {
      ...newUser,
      wallets: [wallet],
    },
  });
}
