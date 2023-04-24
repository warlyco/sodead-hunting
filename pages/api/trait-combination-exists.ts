import { client } from "@/graphql/backend-client";
import { GET_TRAIT_INSTANCES_BY_CREATURE_VIA_NFT_COLLECTION_ID } from "@/graphql/queries/get-trait-instances-by-creature-via-nft-collection-id";
import { NoopResponse } from "@/pages/api/add-account";
import type { NextApiRequest, NextApiResponse } from "next";

export type CreatureTraitInstance = {
  id: string;
  trait: {
    id: string;
    name: string;
  };
  value: string;
};

type TraitCombination = {
  trait: string;
  value: string;
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
    combinations,
    nftCollectionId = "334a2b4f-b0c6-4128-94b5-0123cb1bff0a", // SoDead
    noop,
  }: {
    combinations: TraitCombination[];
    nftCollectionId: string;
    noop?: boolean;
  } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "trait-combination-exists",
    });

  if (!combinations) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const { sodead_creatures }: { sodead_creatures: CreatureTraitInstance[] } =
    await client.request({
      document: GET_TRAIT_INSTANCES_BY_CREATURE_VIA_NFT_COLLECTION_ID,
      variables: {
        id: nftCollectionId,
      },
    });

  console.log({ sodead_creatures });

  return res.status(200).json({ sodead_creatures });
}
