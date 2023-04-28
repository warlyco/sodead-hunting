import { client } from "@/graphql/backend-client";
import { GET_TRAIT_COMBINATION_HASHES } from "@/graphql/queries/get-trait-combination-hashes";
import { NoopResponse } from "@/pages/api/add-account";
import { ModeledTrait } from "@/pages/profile/[id]";
import { getHashForTraitCombination } from "@/utils/nfts/get-hash-for-trait-combination";
import type { NextApiRequest, NextApiResponse } from "next";

export type CreatureTraitInstance = {
  id: string;
  trait: {
    id: string;
    name: string;
  };
  value: string;
};

type TraitHashResponse = {
  traitCombinationHash: string;
  id: string;
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
    combinations: ModeledTrait[];
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

  let mappedCombinations;

  if (combinations[0]?.trait_type) {
    mappedCombinations = combinations.map(({ trait_type, value }) => ({
      name: trait_type,
      value,
    }));
  } else {
    mappedCombinations = combinations;
  }

  console.log({ mappedCombinations });

  const incomingCombinationHash = await getHashForTraitCombination(
    mappedCombinations
  );

  console.log({ incomingCombinationHash });
  console.log({ combinations });

  const { sodead_creatures }: { sodead_creatures: TraitHashResponse[] } =
    await client.request({
      document: GET_TRAIT_COMBINATION_HASHES,
      // variables: {
      //   nftCollectionId,
      // },
    });

  const exists = sodead_creatures.some(({ traitCombinationHash }) => {
    return traitCombinationHash === incomingCombinationHash;
  });

  console.log({ sodead_creatures });

  return res.status(200).json({ exists });
}
