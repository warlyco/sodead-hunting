const crypto = require("crypto").webcrypto;
import { Creature } from "@/features/creatures/creature-list";
import { client } from "@/graphql/backend-client";
import { UPDATE_CREATURE } from "@/graphql/mutations/update-creature";
import { GET_CREATURE_BY_ID } from "@/graphql/queries/get-creature-by-id";
import { getHashForTraitCombination } from "@/utils/nfts/get-hash-for-trait-combination";
import { getTraitsFromTraitInstances } from "@/utils/nfts/get-traits-from-trait-instances";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  success: boolean;
  updatedCreature: Creature;
  message?: string;
  traitCombinationHash?: string;
};

type ErrorResponse = {
  error: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  global.crypto = crypto;

  const { creatureId, shouldOverride } = req.body;
  const {
    sodead_creatures_by_pk: creature,
  }: { sodead_creatures_by_pk: Creature } = await client.request({
    document: GET_CREATURE_BY_ID,
    variables: {
      id: creatureId,
    },
  });

  if (!creature) {
    res.status(500).json({ error: "Creature not found" });
    return;
  }

  if (creature.traitCombinationHash && !shouldOverride) {
    res.status(200).json({
      success: true,
      updatedCreature: creature,
      message: "Creature already has a trait combination hash",
      traitCombinationHash: creature.traitCombinationHash,
    });
    return;
  }

  const {
    update_sodead_creatures_by_pk,
  }: { update_sodead_creatures_by_pk: Creature } = await client.request({
    document: UPDATE_CREATURE,
    variables: {
      id: creature.id,
      setInput: {
        traitCombinationHash: await getHashForTraitCombination(
          getTraitsFromTraitInstances(creature.traitInstances)
        ),
      },
    },
  });

  res.status(200).json({
    success: true,
    updatedCreature: update_sodead_creatures_by_pk,
    message: "Successfully added trait combination hash to creature",
  });
}
