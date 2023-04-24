// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ENABLE_DISABLE_ACTIVITY } from "@/graphql/mutations/enable-disable-activity";
import { NoopResponse } from "@/pages/api/add-account";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | User
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, enable, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "enable-disable-activity",
    });

  if (!id) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const {
      update_sodead_activities_by_pk,
    }: { update_sodead_activities_by_pk: Data } = await client.request({
      document: ENABLE_DISABLE_ACTIVITY,
      variables: { id, isActive: !!enable },
    });

    console.log(
      "update_sodead_activities_by_pk: ",
      update_sodead_activities_by_pk
    );

    res.status(200).json(update_sodead_activities_by_pk);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ error });
  }
}
