// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const SO_DEAD_FIRST_VERIFIED_CREATORS = [
  "BEJRdmGxhhWNGtjWqvkZfTwJg3ntMMYN6gCRxRgKrPYU",
  "Bm1Dy1qjqBd9crwpunnve1RejrxVDtddvyCfqhAebDQ4",
  "GCpHuz3UX8PKeMCosM7uN4FYkRsDWVbadpScH5juctBP",
];

type Data =
  | any
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
  } = req.body;

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
          types: ["NFT_LISTING"],
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

    console.log("~~data: ", data);
    const nfts = data?.result?.[0]?.nfts || [];
    res.status(200).json({ ...data, nfts });
  } catch (error) {
    console.log("~~error: ", error);
    res.status(500).json({ error: "No metadata found" });
  }
}
