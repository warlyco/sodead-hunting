import { gql } from "@apollo/client";

export const RESET_BURN_COUNT = gql`
  mutation RESET_BURN_COUNT($walletId: uuid!) {
    update_sodead_burnCounts(
      where: { walletId: { _eq: $walletId } }
      _set: {
        currentCount: 0
        tokenMintAddress: $tokenMintAddress
        txAddress: $txAddress
      }
    ) {
      returning {
        id
        tokenMintAddress
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
