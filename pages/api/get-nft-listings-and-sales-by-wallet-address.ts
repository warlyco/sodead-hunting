// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NoopResponse } from "@/pages/api/add-account";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type NftFromNftEventFromHelius = {
  mint: string;
  name: string;
  firstVerifiedCreator: string;
  verifiedCollectionAddress: string;
  burned: boolean;
};

type TokenTransferFromNftEventFromHelius = {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
};

type NativeTokenTransferFromNftEventFromHelius = {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
};

export type NftEventFromHelius = {
  signature: string;
  timestamp: number;
  slot: number;
  type: "NFT_SALE" | "NFT_LISTING";
  source: string;
  description: string;
  amount: number;
  fee: number;
  feePayer: string;
  saleType: string;
  buyer: string;
  seller: string;
  staker: string;
  nfts: NftFromNftEventFromHelius[];
  tokenTransfers: TokenTransferFromNftEventFromHelius[];
  nativeTransfers: NativeTokenTransferFromNftEventFromHelius[];
};

const SO_DEAD_FIRST_VERIFIED_CREATORS = [
  "BEJRdmGxhhWNGtjWqvkZfTwJg3ntMMYN6gCRxRgKrPYU",
  "Bm1Dy1qjqBd9crwpunnve1RejrxVDtddvyCfqhAebDQ4",
  "GCpHuz3UX8PKeMCosM7uN4FYkRsDWVbadpScH5juctBP",
];

const mapNftEvents = (nftEvents: NftEventFromHelius[]) => {
  return nftEvents.map(
    ({
      signature,
      timestamp,
      description,
      amount,
      feePayer,
      buyer,
      seller,
      nfts,
    }) => {
      return {
        signature,
        timestamp,
        description,
        amount,
        feePayer,
        buyer,
        seller,
        nfts,
      };
    }
  );
};

type Data =
  | any
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    walletAddress,
    firstVerifiedCreators = SO_DEAD_FIRST_VERIFIED_CREATORS,
    startTime,
    noop,
  } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "get-nft-listings-by-wallet-address",
    });

  if (
    !walletAddress ||
    !firstVerifiedCreators ||
    !process.env.HELIUS_API_KEY ||
    !startTime ||
    typeof Number(startTime) !== "number"
  ) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const startTimeNumber = Number(startTime);
  console.log("~~startTimeNumber: ", startTimeNumber);

  try {
    const { data } = await axios.post(
      `https://api.helius.xyz/v1/nft-events?api-key=${process.env.HELIUS_API_KEY}`,
      {
        query: {
          accounts: [walletAddress],
          types: ["NFT_LISTING", "NFT_SALE", "NFT_CANCEL_LISTING"],
          startTime: startTimeNumber,
          nftCollectionFilters: {
            firstVerifiedCreator: firstVerifiedCreators,
          },
        },
        options: {
          limit: 100,
          sortOrder: "DESC",
        },
      }
    );

    const allEvents = data?.result || [];
    // sort by timestamp
    const sortedEvents = allEvents.sort(
      (a: any, b: any) => b.timestamp - a.timestamp
    );

    const listings = mapNftEvents(
      sortedEvents.filter((event: any) => event.type === "NFT_LISTING")
    );
    const sales = mapNftEvents(
      sortedEvents.filter((event: any) => event.type === "NFT_SALE")
    );
    const cancelledListings = mapNftEvents(
      sortedEvents.filter((event: any) => event.type === "NFT_CANCEL_LISTING")
    );

    console.log("~~data: ", { sales, listings, cancelledListings });
    res.status(200).json({ sales, listings, cancelledListings });
  } catch (error) {
    console.log("~~error: ", error);
    res.status(500).json({ error: "No metadata found" });
  }
}
