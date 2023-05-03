// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_ACCOUNT } from "@/graphql/mutations/add-account";
import { UPDATE_USER } from "@/graphql/mutations/update-user";
import { logError } from "@metaplex-foundation/js";

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
  endpoint: string;
};

export type UserAndAccountResponse = {
  account: Account;
  user: User;
};

type Data =
  | UserAndAccountResponse
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  logError({
    error: {
      code: 2,
      message: "Attempting to save Discord account info",
      rawError: JSON.stringify(req.body),
    },
  });
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
      endpoint: "add-account",
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

  logError({
    error: {
      code: 3,
      message: "Attempting to save Discord account info",
      rawError: JSON.stringify(req.body),
    },
  });

  if (!imageUrl || !providerId || !providerAccountId || !username) {
    logError({
      error: {
        code: 500,
        message: "Could not save Discord account info",
        rawError: JSON.stringify({
          discordUser: req.body,
        }),
      },
    });
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

  logError({
    error: {
      code: 4,
      message: "Attempting to save Discord account info",
      rawError: JSON.stringify(req.body),
    },
  });

  try {
    const {
      insert_sodead_accounts_one,
    }: { insert_sodead_accounts_one: Account } = await client.request({
      document: ADD_ACCOUNT,
      variables,
    });

    logError({
      error: {
        code: 5,
        message: "Attempting to save Discord account info",
        rawError: JSON.stringify(req.body),
      },
    });

    const { update_sodead_users_by_pk }: { update_sodead_users_by_pk: User } =
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

    logError({
      error: {
        code: 6,
        message: "Attempting to save Discord account info",
        rawError: JSON.stringify(req.body),
      },
    });

    console.log("insert_sodead_accounts_one: ", insert_sodead_accounts_one);

    res.status(200).json({
      account: insert_sodead_accounts_one,
      user: update_sodead_users_by_pk,
    });
  } catch (error) {
    logError({
      error: {
        code: 500,
        message: "Could not save Discord account info",
        rawError: JSON.stringify({
          error,
          discordUser: req.body,
        }),
      },
    });
    res.status(500).json({ error });
  }
}
