// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import request from "graphql-request";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import type { NextApiRequest, NextApiResponse } from "next";
import { BASE_URL } from "@/constants/constants";

export type TokenMetadata = {
  image: string;
  decimals: number;
  name: string;
  symbol: string;
};

type Data =
  | TokenMetadata
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { mintAddress } = req.body;

  if (!mintAddress || !process.env.HELIUS_API_KEY) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  console.log("trying to get token metadata from helius...");

  const { data: tokenMetadata } = await axios.post(
    `${BASE_URL}/api/get-token-metadata-from-helius`,
    {
      mintAddress,
    }
  );

  if (!tokenMetadata) {
    res.status(500).json({ error: "Token not found" });
    return;
  }

  console.log("tokenMetadata: ", tokenMetadata);
  try {
    const { insert_sodead_tokens_one }: { insert_sodead_tokens_one: Data } =
      await request({
        url: process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT!,
        document: ADD_TOKEN,
        variables: {
          mintAddress,
          ...tokenMetadata,
        },
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });

    console.log("insert_sodead_tokens_one: ", insert_sodead_tokens_one);

    res.status(200).json(insert_sodead_tokens_one);
  } catch (error) {
    res.status(500).json({ error });
  }
}
