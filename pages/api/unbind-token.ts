import { client } from "@/graphql/backend-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { UNBIND_TOKEN } from "@/graphql/mutations/unbind-token";

type Data =
  | Token
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.body;
  console.log("unbind-token.ts", { id });

  if (!id) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const {
    update_sodead_tokens_by_pk: updatedToken,
  }: { update_sodead_tokens_by_pk: Token } = await client.request(
    UNBIND_TOKEN,
    {
      id,
    }
  );

  console.log({ updatedToken });

  if (!updatedToken) {
    res.status(500).json({ error: "There was an unexpected error" });
    return;
  }

  res.status(200).json(updatedToken);
}
