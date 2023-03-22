import { gql } from "@apollo/client";

export const GET_LOOT_BOXES_WITH_DETAILS = gql`
  query GET_LOOT_BOXES_WITH_DETAILS {
    sodead_lootBoxes {
      id
      createdAt
      name
      rarity {
        name
        id
      }
      itemRewardCollections {
        id
        itemCollection {
          id
          amount
          imageUrl
          name
          item {
            id
            name
            token {
              id
              mintAddress
            }
          }
        }
      }
      imageUrl
      itemCostCollections {
        itemCollection {
          amount
          id
          name
          item {
            id
            name
            imageUrl
            token {
              mintAddress
            }
          }
        }
        id
      }
      itemRewardCollections_aggregate {
        aggregate {
          count
        }
      }
      itemGateCollections {
        id
        itemCollection {
          amount
          item {
            id
            name
            token {
              id
              mintAddress
            }
          }
        }
      }
    }
  }
`;
