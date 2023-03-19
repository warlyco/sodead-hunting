import { gql } from "@apollo/client";

export const GET_KEYS = gql`
  query GET_KEYS {
    sodead_keys {
      id
      imageUrl
      createdAt
      name
      lootBoxKeys {
        keyAmount
        lootBox {
          id
          name
          imageUrl
        }
        id
      }
    }
  }
`;
