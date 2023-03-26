import { gql } from "@apollo/client";

export const ADD_BURN_ATTEMPT = gql`
  mutation ADD_BURN_ATTEMPT(
    $txAddress: String
    $walletAddress: String
    $mintIds: jsonb
  ) {
    insert_sodead_burnAttempts_one(
      object: {
        txAddress: $txAddress
        walletAddress: $walletAddress
        mintIds: $mintIds
      }
    ) {
      id
      txAddress
      walletAddress
      mintIds
    }
  }
`;
