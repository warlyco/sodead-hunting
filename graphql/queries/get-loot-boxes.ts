import { gql } from "@apollo/client";

export const GET_LOOT_BOXES = gql`
  query GET_LOOT_BOXES {
    sodead_lootBoxes {
      id
      name
      imageUrk
      createdAt
      keys {
        key {
          id
          name
        }
        id
        keyAmount
      }
      rarity {
        name
        id
      }
    }
  }
`;
