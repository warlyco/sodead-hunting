import { gql } from "@apollo/client";

export const GET_TOKENS = gql`
  query GET_TOKENS {
    sodead_tokens(order_by: { createdAt: desc }) {
      id
      createdAt
      decimals
      imageUrl
      mintAddress
      name
      symbol
      items {
        id
        name
      }
      mounts {
        id
        name
      }
      nftCollection {
        id
        name
      }
      vampires {
        id
        name
      }
      isFungible
    }
  }
`;
