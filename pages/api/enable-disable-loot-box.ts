// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ENABLE_DISABLE_LOOT_BOX } from "@/graphql/mutations/enable-disable-loot-box";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | User
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, enable } = req.body;

  if (!id) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const {
      update_sodead_lootBoxes_by_pk,
    }: { update_sodead_lootBoxes_by_pk: Data } = await client.request({
      document: ENABLE_DISABLE_LOOT_BOX,
      variables: { id, isEnabled: !!enable },
    });

    console.log(
      "update_sodead_lootBoxes_by_pk: ",
      update_sodead_lootBoxes_by_pk
    );

    res.status(200).json(update_sodead_lootBoxes_by_pk);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error });
  }
}
