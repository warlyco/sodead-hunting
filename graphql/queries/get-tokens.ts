import { gql } from "@apollo/client";

export const GET_TOKENS = gql`
  query GET_TOKENS {
    sodead_tokens(order_by: { createdAt: desc }) {
      name
      id
      mintAddress
      imageUrl
      decimals
      symbol
    }
  }
`;
