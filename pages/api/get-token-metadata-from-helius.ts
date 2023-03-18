// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
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
  const { address } = req.body;

  if (!address || !process.env.HELIUS_API_KEY) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const { data } = await axios.post(
    `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_API_KEY}`,
    {
      mintAccounts: [address],
    }
  );

  const tokenMetadata: TokenMetadataFromHelius = data?.[0];

  console.log("tokenMetadata: ", tokenMetadata);
  try {
    const { name, symbol, uri } = tokenMetadata.onChainMetadata.metadata.data;
    const { decimals } =
      tokenMetadata.onChainAccountInfo.accountInfo.data.parsed.info;

    const { data } = await axios.get(uri);

    res.status(200).json({
      image: data.image,
      name,
      symbol,
      decimals,
    });
  } catch (error) {
    res.status(500).json({ error: "No metadata found" });
  }
}
