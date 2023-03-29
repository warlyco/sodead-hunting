import { gql } from "@apollo/client";

export const GET_BURN_ATTEMPT_BY_TOKEN_MINT_ADDRESS = gql`
  query GET_BURN_ATTEMPT_BY_TOKEN_MINT_ADDRESS($tokenMintAddress: jsonb!) {
    sodead_burnAttempts(where: { mintIds: { _contains: $tokenMintAddress } }) {
      lootBox {
        id
      }
      hashList {
        id
        name
      }
      txAddress
      walletAddress
    }
  }
`;
