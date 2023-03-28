// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { INCREMENT_BURN_COUNT } from "@/graphql/mutations/increment-burn-count";
export type BurnCount = {
  currentCount: number;
  id: string;
  txAddress: string;
  tokenMintAddress: string;
  wallet: {
    address: string;
    id: string;
  };
};

type Data =
  | BurnCount
  | {
      error: unknown;
    };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { walletId, tokenMintAddress, txAddress } = req.body;

  if (!walletId || !tokenMintAddress || !txAddress) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  let setInput = removeEmpty({
    tokenMintAddress,
    nftMintAddress,
  });

  const { update_sodead_items_by_pk }: { update_sodead_items_by_pk: Item } =
    await client.request(INCREMENT_BURN_COUNT, {
      id,
      setInput,
    });

  if (!update_sodead_items_by_pk) {
    res.status(500).json({ error: "Token claim source not found" });
    return;
  }

  // res.status(200).json({ isEnabled: returning.isEnabled });
  res.status(200).json(update_sodead_items_by_pk);
}
