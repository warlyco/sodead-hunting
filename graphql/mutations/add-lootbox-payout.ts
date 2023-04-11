import { gql } from "@apollo/client";

export const ADD_LOOTBOX_PAYOUT = gql`
  mutation ADD_LOOTBOX_PAYOUT(
    $txAddress: String!
    $amount: numeric!
    $tokenId: uuid!
    $createdAtWithTimezone: timestamptz!
    $walletAddress: String!
    $lootBoxId: uuid!
  ) {
    insert_sodead_payouts_one(
      object: {
        txAddress: $txAddress
        amount: $amount
        tokenId: $tokenId
        createdAtWithTimezone: $createdAtWithTimezone
        walletAddress: $walletAddress
        lootBoxId: $lootBoxId
      }
    ) {
      id
      txAddress
      createdAt
    }
  }
`;
