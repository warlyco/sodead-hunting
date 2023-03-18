import { gql } from "@apollo/client";

export const GET_TRAITS = gql`
  query GET_TRAITS {
    sodead_traits {
      id
      name
      token {
        id
        mintAddress
        name
        imageUrl
      }
      rarity {
        id
        name
      }
      traitCategory {
        id
        name
      }
      createdAt
    }
  }
`;
