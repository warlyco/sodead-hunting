import { gql } from "@apollo/client";

export const ADD_ITEM_PAYOUT = gql`
  mutation ADD_ITEM_PAYOUT(
    $txAddress: String!
    $amount: numeric!
    $tokenId: uuid!
    $itemId: uuid!
    $createdAtWithTimezone: timestamptz!
  ) {
    insert_sodead_payouts_one(
      object: {
        txAddress: $txAddress
        amount: $amount
        tokenId: $tokenId
        itemId: $itemId
        createdAtWithTimezone: $createdAtWithTimezone
      }
    ) {
      id
      txAddress
      createdAt
    }
  }
`;
