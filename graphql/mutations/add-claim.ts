import { gql } from "@apollo/client";

export const ADD_CLAIM = gql`
  mutation ADD_CLAIM(
    $amount: numeric!
    $claimTime: timestamptz!
    $lootBoxId: uuid!
    $txAddress: String!
    $userId: uuid!
    $walletId: uuid!
  ) {
    insert_sodead_claims_one(
      object: {
        lootBoxId: $lootBoxId
        amount: $amount
        claimTime: $claimTime
        txAddress: $txAddress
        userId: $userId
        walletId: $walletId
      }
    ) {
      amount
      id
      user {
        id
        name
      }
      wallet {
        id
        address
      }
    }
  }
`;
