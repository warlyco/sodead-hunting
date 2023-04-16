// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_ACCOUNT } from "@/graphql/mutations/add-account";
import { UPDATE_USER } from "@/graphql/mutations/update-user";

import type { NextApiRequest, NextApiResponse } from "next";

export type Account = {
  email: string;
  id: string;
  imageUrl: string;
  username: string;
  provider: {
    id: string;
    name: string;
  };
  user?: {
    email: string;
    id: string;
    imageUrl: string;
    name: string;
    primaryWallet: {
      id: string;
      address: string;
    };
  };
};

export type NoopResponse = {
  noop: true;
};

type Data =
  | Account
  | User
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    accessToken,
    tokenType,
    imageUrl,
    email,
    providerId,
    providerAccountId,
    username,
    userId,
    noop = false,
  } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
    });

  console.log({
    accessToken,
    tokenType,
    imageUrl,
    email,
    providerId,
    providerAccountId,
    username,
    userId,
  });

  if (!imageUrl || !email || !providerId || !providerAccountId || !username) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  const variables = {
    imageUrl,
    email,
    providerId,
    providerAccountId,
    username,
    userId,
    tokenType,
    accessToken,
  };

  try {
    const { insert_sodead_accounts_one }: { insert_sodead_accounts_one: Data } =
      await client.request({
        document: ADD_ACCOUNT,
        variables,
      });

    const { update_sodead_users_by_pk }: { update_sodead_users_by_pk: Data } =
      await client.request({
        document: UPDATE_USER,
        variables: {
          id: userId,
          setInput: {
            name: username,
            email: email,
            imageUrl: imageUrl,
          },
        },
      });

    console.log("insert_sodead_accounts_one: ", insert_sodead_accounts_one);

    res.status(200).json(insert_sodead_accounts_one);
  } catch (error) {
    res.status(500).json({ error });
  }
}
