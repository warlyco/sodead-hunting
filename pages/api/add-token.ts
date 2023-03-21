// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import request from "graphql-request";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import type { NextApiRequest, NextApiResponse } from "next";

type TokenMetadataFromHelius = {
  account: string;
  onChainAccountInfo: {
    accountInfo: {
      key: string;
      data: {
        parsed: {
          info: {
            decimals: number;
          };
        };
      };
    };
  };
  onChainMetadata: {
    metadata: {
      data: {
        name: string;
        symbol: string;
        uri: string;
      };
    };
  };
};

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

  const { data } = await axios.post(
    `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
    {
      mintAccounts: [mintAddress],
    }
  );

  const tokenMetadata: TokenMetadataFromHelius = data?.[0];

  if (!tokenMetadata) {
    res.status(500).json({ error: "Token not found" });
    return;
  }

  console.log("tokenMetadata: ", tokenMetadata);
  try {
    const uri = tokenMetadata?.onChainMetadata?.metadata?.data?.uri;

    let offChainMetadata;
    if (uri) {
      const { data } = await axios.get(uri);
      offChainMetadata = data;
    }

    const variables = {
      name: tokenMetadata?.onChainMetadata?.metadata?.data?.name || "",
      decimals:
        tokenMetadata?.onChainAccountInfo?.accountInfo?.data?.parsed?.info
          ?.decimals,
      imageUrl: offChainMetadata?.image || "",
      mintAddress,
      symbol: tokenMetadata?.onChainMetadata?.metadata?.data?.symbol || "",
    };

    console.log("variables: ", { variables });

    const { insert_sodead_tokens_one }: { insert_sodead_tokens_one: Data } =
      await request({
        url: process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT!,
        document: ADD_TOKEN,
        variables,
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
