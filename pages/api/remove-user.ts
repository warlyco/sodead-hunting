import { User } from "@/features/admin/users/users-list-item";
import { client } from "@/graphql/backend-client";
import { REMOVE_ACCOUNT } from "@/graphql/mutations/remove-account";
import { REMOVE_PAYOUTS_BY_WALLET_ID } from "@/graphql/mutations/remove-payouts-by-wallet-id";
import { REMOVE_PRIMARY_WALLET } from "@/graphql/mutations/remove-primary-wallet";
import { REMOVE_USER } from "@/graphql/mutations/remove-user";
import { REMOVE_WALLET } from "@/graphql/mutations/remove-wallet";
import { GET_USER_BY_ID } from "@/graphql/queries/get-user-by-id";
import { Account, NoopResponse } from "@/pages/api/add-account";
import { Wallet } from "@/pages/me";
import { Payout } from "@/pages/profile/[id]";
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | any
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
    });

  if (!id) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const { sodead_users_by_pk: user }: { sodead_users_by_pk: User } =
      await client.request({
        document: GET_USER_BY_ID,
        variables: {
          id,
        },
      });

    console.log({ user });

    if (!user) {
      res.status(500).json({ error: "User not found" });
      return;
    }

    console.log(" removing wallet");
    if (user.primaryWallet?.id) {
      const { update_sodead_users_by_pk }: { update_sodead_users_by_pk: User } =
        await client.request({
          document: REMOVE_PRIMARY_WALLET,
          variables: {
            id,
          },
        });
    }

    // remove account
    if (user.accounts?.length) {
      console.log(" removing account");
      const {
        delete_sodead_accounts_by_pk,
      }: { delete_sodead_accounts_by_pk: Account } = await client.request({
        document: REMOVE_ACCOUNT,
        variables: {
          id: user.accounts?.[0]?.id,
        },
      });
    }

    if (user.wallets?.length) {
      // remove payouts
      const { delete_sodead_payouts }: { delete_sodead_payouts: Payout[] } =
        await client.request({
          document: REMOVE_PAYOUTS_BY_WALLET_ID,
          variables: {
            id: user.wallets?.[0]?.id,
          },
        });

      for (let wallet of user.wallets) {
        const {
          delete_sodead_wallets_by_pk,
        }: { delete_sodead_wallets_by_pk: Wallet } = await client.request({
          document: REMOVE_WALLET,
          variables: {
            id: wallet.id,
          },
        });
      }
    }

    const {
      delete_sodead_users_by_pk,
    }: { delete_sodead_users_by_pk: Account } = await client.request({
      document: REMOVE_USER,
      variables: {
        id: user.id,
      },
    });

    res.status(200).json({ success: true, user: delete_sodead_users_by_pk });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    return;
  }
}
