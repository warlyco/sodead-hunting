import { gql } from "@apollo/client";

export const GET_CREATURE_BY_TOKEN_MINT_ADDRESS = gql`
  query GET_CREATURE_BY_TOKEN_MINT_ADDRESS($mintAddress: String!) {
    sodead_creatures(where: { token: { mintAddress: { _eq: $mintAddress } } }) {
      name
      id
    }
  }
`;
