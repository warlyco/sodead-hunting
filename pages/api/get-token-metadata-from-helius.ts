// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NoopResponse } from "@/pages/api/add-account";
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
  legacyMetadata: {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    logoURI: string;
  };
};

export type TokenMetadata = {
  imageUrl: string;
  decimals: number;
  name: string;
  symbol: string;
};

type Data =
  | TokenMetadata
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { mintAddress, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
    });

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

  console.log("tokenMetadata: ", tokenMetadata);

  let offChainMetadata;

  if (tokenMetadata?.onChainMetadata?.metadata?.data?.uri) {
    try {
      const { data } = await axios.get(
        tokenMetadata?.onChainMetadata?.metadata?.data?.uri
      );
      offChainMetadata = data;
    } catch (error) {
      console.log("Error fetching off-chain metadata: ", error);
    }
  }

  const metadata = {
    imageUrl: offChainMetadata?.image || tokenMetadata?.legacyMetadata?.logoURI,
    name:
      tokenMetadata?.onChainMetadata?.metadata?.data?.name ||
      tokenMetadata?.legacyMetadata?.name,
    symbol:
      tokenMetadata?.onChainMetadata?.metadata?.data?.symbol ||
      tokenMetadata?.legacyMetadata?.symbol,
    decimals:
      tokenMetadata?.onChainAccountInfo?.accountInfo?.data?.parsed?.info
        ?.decimals ||
      tokenMetadata?.legacyMetadata?.decimals ||
      0,
  };

  console.log("~~metadata: ", metadata);

  res.status(200).json(metadata);
  try {
  } catch (error) {
    console.log("~~error: ", error);
    res.status(500).json({ error: "No metadata found" });
  }
}
