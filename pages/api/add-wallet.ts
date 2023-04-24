// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_WALLET } from "@/graphql/mutations/add-wallet";
import { NoopResponse } from "@/pages/api/add-account";
import request from "graphql-request";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | User
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { address, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "add-wallet",
    });

  console.log("~~adding wallet", address);

  if (!address) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const { insert_sodead_wallets_one }: { insert_sodead_wallets_one: Data } =
      await client.request({
        document: ADD_WALLET,
        variables: { address },
      });

    console.log("insert_sodead_wallets_one: ", insert_sodead_wallets_one);

    res.status(200).json(insert_sodead_wallets_one);
  } catch (error) {
    console.log("error adding wallet: ", error);
    res.status(500).json({ error });
  }
}
