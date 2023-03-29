import { gql } from "@apollo/client";

export const INCREMENT_BURN_COUNT = gql`
  mutation INCREMENT_BURN_COUNT(
    $walletId: uuid!
    $lootBoxId: uuid!
    $tokenMintAddress: String!
    $txAddress: String!
    $currentCount: Int!
  ) {
    update_sodead_burnCounts(
      where: { walletId: { _eq: $walletId } }
      _set: {
        currentCount: $currentCount
        tokenMintAddress: $tokenMintAddress
        txAddress: $txAddress
        lootBoxId: $lootBoxId
      }
    ) {
      returning {
        id
        tokenMintAddress
        lootBox {
          id
          name
        }
        currentCount
        txAddress
        wallet {
          address
          id
        }
      }
    }
  }
`;
