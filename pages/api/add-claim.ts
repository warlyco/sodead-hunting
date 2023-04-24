// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { ADD_CLAIM } from "@/graphql/mutations/add-claim";
import { NoopResponse } from "@/pages/api/add-account";
import type { NextApiRequest, NextApiResponse } from "next";

export type Claim = {
  amount: number;
  claimTime: string;
  id: string;
  lootBox: {
    id: string;
    imageUrl: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
};

type Data =
  | Claim
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { amount, claimTime, lootBoxId, txAddress, userId, walletId, noop } =
    req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "add-claim",
    });

  if (
    !amount ||
    !claimTime ||
    !lootBoxId ||
    !txAddress ||
    !userId ||
    !walletId
  ) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const { insert_sodead_claims_one }: { insert_sodead_claims_one: Data } =
      await client.request({
        document: ADD_CLAIM,
        variables: {
          amount,
          claimTime,
          lootBoxId,
          txAddress,
          userId,
          walletId,
        },
      });

    console.log("insert_sodead_claims_one: ", insert_sodead_claims_one);

    res.status(200).json(insert_sodead_claims_one);
  } catch (error) {
    res.status(500).json({ error });
  }
}
