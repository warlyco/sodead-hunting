import { gql } from "@apollo/client";

export const ADD_LOOTBOX_PAYOUT = gql`
  mutation ADD_LOOTBOX_PAYOUT(
    $txAddress: String!
    $amount: numeric!
    $tokenId: uuid!
    $createdAtWithTimezone: timestamptz!
    $walletId: uuid!
    $lootBoxId: uuid!
  ) {
    insert_sodead_payouts_one(
      object: {
        txAddress: $txAddress
        amount: $amount
        tokenId: $tokenId
        createdAtWithTimezone: $createdAtWithTimezone
        walletId: $walletId
        lootBoxId: $lootBoxId
      }
    ) {
      id
      txAddress
      createdAt
    }
  }
`;
