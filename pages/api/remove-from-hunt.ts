// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { client } from "@/graphql/backend-client";
import { REMOVE_FROM_HUNT } from "@/graphql/mutations/remove-from-hunt";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | Hunt[]
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { huntId, mainCharacterIds } = req.body;

  if (!huntId || !mainCharacterIds) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const removals: Hunt[] = [];

  try {
    for (const mainCharacterId of mainCharacterIds) {
      const {
        delete_sodead_activityInstances,
      }: { delete_sodead_activityInstances: Hunt } = await client.request({
        document: REMOVE_FROM_HUNT,
        variables: {
          activityId: huntId,
          mainCharacterId,
        },
      });
      removals.push(delete_sodead_activityInstances);
    }

    console.log("removals: ", removals);

    res.status(200).json(removals);
  } catch (error) {
    res.status(500).json({ error });
  }
}
