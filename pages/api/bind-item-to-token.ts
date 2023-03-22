import { client } from "@/graphql/backend-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { BIND_ITEM_TO_TOKEN } from "@/graphql/mutations/bind-item-to-token";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { GET_TOKEN_BY_MINT_ADDRESS } from "@/graphql/queries/get-token-by-mint-address";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import { GET_ITEM_BY_ID } from "@/graphql/queries/get-item-by-id";
import { Item } from "@/pages/api/add-item";

type Data =
  | Token
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { mintAddress, itemId } = req.body;

  if (!itemId || !mintAddress) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const { sodead_tokens }: { sodead_tokens: Token[] } = await client.request(
    GET_TOKEN_BY_MINT_ADDRESS,
    {
      mintAddress,
    }
  );

  const { sodead_items_by_pk: item }: { sodead_items_by_pk: Item } =
    await client.request(GET_ITEM_BY_ID, {
      id: itemId,
    });

  let token = sodead_tokens?.[0];

  console.log({ sodead_tokens });

  if (!token) {
    console.log("Token not found, adding it to the database");
    try {
      const { data: newToken }: { data: Token } = await axios.post(
        `${BASE_URL}/api/add-token`,
        { mintAddress }
      );
      console.log("i am data", newToken);
      token = newToken;
    } catch (error: any) {
      console.error(
        "!!!error",
        // Object.keys(error),
        error.response.data.error.response
        // error.message
      );
      res
        .status(500)
        .json({ error: "There was an unexpected error adding the token" });
      return;
    }
  }

  if (item?.token?.id) {
    res.status(500).json({ error: "Token already bound to an item" });
    return;
  }

  const {
    update_sodead_items_by_pk: updatedToken,
  }: { update_sodead_items_by_pk: Data } = await client.request(
    BIND_ITEM_TO_TOKEN,
    {
      tokenId: token?.id,
      itemId,
    }
  );

  if (!updatedToken) {
    res.status(500).json({ error: "There was an unexpected error" });
    return;
  }

  res.status(200).json(updatedToken);
}
