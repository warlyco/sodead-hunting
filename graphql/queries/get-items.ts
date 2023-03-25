import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query GET_ITEMS {
    sodead_items {
      createdAt
      id
      imageUrl
      isConsumable
      isCraftable
      name
      baseStatModifier {
        effectAmount
        id
        affectedBaseStat {
          id
          name
        }
        createdAt
        name
      }
      category {
        id
        name
      }
      token {
        id
        name
        mintAddress
      }
    }
  }
`;
