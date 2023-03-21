import { client } from "@/graphql/backend-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { BIND_ITEM_TO_TOKEN } from "@/graphql/mutations/bind-item-to-token";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { GET_TOKEN_BY_MINT_ADDRESS } from "@/graphql/queries/get-token-by-mint-address";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";

type TokenResponse = {
  returning: Token[];
};

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

  console.log({ sodead_tokens });

  if (!sodead_tokens?.[0]) {
    console.log("Token not found, adding it to the database");
    try {
      await axios.post(`${BASE_URL}/api/add-token`, { mintAddress });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "There was an unexpected error adding the token" });
      return;
    }
  }

  if (sodead_tokens?.[0]?.item.id) {
    res.status(500).json({ error: "Token already bound to an item" });
    return;
  }

  const { update_sodead_tokens }: { update_sodead_tokens: TokenResponse } =
    await client.request(BIND_ITEM_TO_TOKEN, {
      mintAddress,
      itemId,
    });

  console.log({ update_sodead_tokens });

  const updatedToken = update_sodead_tokens?.returning?.[0];

  if (!updatedToken) {
    res.status(500).json({ error: "There was an unexpected error" });
    return;
  }

  res.status(200).json(updatedToken);
}
