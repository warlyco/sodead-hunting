// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_CLAIM } from "@/graphql/mutations/add-claim";
import { ADD_TO_HUNT } from "@/graphql/mutations/add-to-hunt";
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

  const additions: Hunt[] = [];

  try {
    for (const mainCharacterId of mainCharacterIds) {
      const {
        insert_sodead_activityInstances_one,
      }: { insert_sodead_activityInstances_one: Hunt } = await client.request({
        document: ADD_TO_HUNT,
        variables: {
          activityId: huntId,
          mainCharacterId,
        },
      });
      additions.push(insert_sodead_activityInstances_one);
    }

    console.log("additions: ", additions);

    res.status(200).json(additions);
  } catch (error) {
    res.status(500).json({ error });
  }
}
