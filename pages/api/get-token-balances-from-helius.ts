// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NoopResponse } from "@/pages/api/add-account";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export type TokenBalance = {
  tokenAccount: string;
  mint: string;
  amount: number;
  decimals: number;
};

type Data =
  | TokenBalance[]
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { walletAddress, mintAddresses, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "get-token-balances-from-helius",
    });

  if (!walletAddress || !process.env.HELIUS_API_KEY) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const { data } = await axios.get(
    `https://api.helius.xyz/v0/addresses/${walletAddress}/balances?api-key=${process.env.HELIUS_API_KEY}`
  );

  let { tokens: balances }: { tokens: TokenBalance[] } = data;

  if (mintAddresses && mintAddresses.length > 0) {
    balances = balances.filter((balance) =>
      mintAddresses.includes(balance.mint)
    );
  }

  console.log("~~balances: ", balances);

  res.status(200).json(balances);
  try {
  } catch (error) {
    console.log("~~error: ", error);
    res.status(500).json({ error: "No metadata found" });
  }
}
