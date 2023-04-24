import { Item } from "@/pages/api/add-item";
import { client } from "@/graphql/backend-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { removeEmpty } from "@/utils/object";
import { UPDATE_ITEM } from "@/graphql/mutations/update-item";
import { NoopResponse } from "@/pages/api/add-account";

type Data =
  | Item
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, tokenMintAddress, nftMintAddress, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
    });

  if (!id || !(tokenMintAddress && nftMintAddress)) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  let setInput = removeEmpty({
    tokenMintAddress,
    nftMintAddress,
  });

  const { update_sodead_items_by_pk }: { update_sodead_items_by_pk: Item } =
    await client.request(UPDATE_ITEM, {
      id,
      setInput,
    });

  if (!update_sodead_items_by_pk) {
    res.status(500).json({ error: "Token claim source not found" });
    return;
  }

  // res.status(200).json({ isEnabled: returning.isEnabled });
  res.status(200).json(update_sodead_items_by_pk);
}
