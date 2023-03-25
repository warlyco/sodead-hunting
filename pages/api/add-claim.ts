// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { ADD_CLAIM } from "@/graphql/mutations/add-claim";
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
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { amount, claimTime, lootBoxId, txAddress, userId, walletId } =
    req.body;

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
