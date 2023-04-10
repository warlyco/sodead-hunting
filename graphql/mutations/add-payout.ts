import { gql } from "@apollo/client";

export const ADD_PAYOUT = gql`
  mutation ADD_PAYOUT(
    $txAddress: String!
    $amount: numeric!
    $tokenId: uuid!
    $createdAtWithTimezone: timestamptz!
  ) {
    insert_sodead_payouts_one(
      object: {
        txAddress: $txAddress
        amount: $amount
        tokenId: $tokenId
        createdAtWithTimezone: $createdAtWithTimezone
      }
    ) {
      id
      txAddress
      createdAt
    }
  }
`;
