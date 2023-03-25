// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ADD_ACCOUNT } from "@/graphql/mutations/add-account";
import request from "graphql-request";
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
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
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
  };

  try {
    const { insert_sodead_accounts_one }: { insert_sodead_accounts_one: Data } =
      await request({
        url: process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT!,
        document: ADD_ACCOUNT,
        variables,
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });

    console.log("insert_sodead_accounts_one: ", insert_sodead_accounts_one);

    res.status(200).json(insert_sodead_accounts_one);
  } catch (error) {
    res.status(500).json({ error });
  }
}
