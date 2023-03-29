import { gql } from "@apollo/client";

export const ADD_BURN_ATTEMPT = gql`
  mutation ADD_BURN_ATTEMPT(
    $txAddress: String
    $walletAddress: String
    $mintIds: jsonb
    $hashListId: uuid!
    $lootBoxId: uuid!
  ) {
    insert_sodead_burnAttempts_one(
      object: {
        txAddress: $txAddress
        walletAddress: $walletAddress
        mintIds: $mintIds
        hashListId: $hashListId
        $lootBoxId: $lootBoxId
      }
    ) {
      id
      txAddress
      walletAddress
      mintIds
      hashList {
        id
      }
      lootBox {
        id
      }
    }
  }
`;
