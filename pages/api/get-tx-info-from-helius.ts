// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export type InstructionsFromHelius = {
  data: string;
  accounts: string[];
  programId: string;
  innerInstructions: [];
};

export type TokenBalanceChangesFromHelius = {
  userAccount: string;
  tokenAccount: string;
  rawTokenAmount: {
    tokenAmount: string;
    decimals: number;
  };
  mint: string;
};

export type AccountDataFromHelius = {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges?: TokenBalanceChangesFromHelius[];
};

export type EnhancedTransactionFromHelius = {
  description: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  accountData: AccountDataFromHelius[];
  transactionError: null;
  instructions: InstructionsFromHelius[];
  events: {};
};

type Data =
  | EnhancedTransactionFromHelius
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { txAddress } = req.body;

  if (!txAddress || !process.env.HELIUS_API_KEY) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const { data }: { data: EnhancedTransactionFromHelius[] } =
      await axios.post(
        `https://api.helius.xyz/v0/transactions?api-key=${process.env.HELIUS_API_KEY}`,
        {
          transactions: [txAddress],
        }
      );

    //   let { tokens: balances }: { tokens: TokenBalance[] } = data;

    const tx = data?.[0];

    if (!tx) {
      res.status(500).json({ error: "No transaction found" });
      return;
    }

    console.log("~~tx: ", tx);

    res.status(200).json(tx);
  } catch (error) {
    console.log("~~error: ", error);
    res.status(500).json({ error: "No transaction found" });
  }
}
