import { gql } from "@apollo/client";

export const GET_LOOT_BOX_BY_ID = gql`
  query MyQuery($id: uuid!) {
    sodead_lootBoxes_by_pk(id: $id) {
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
      itemCostCollection {
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
      itemGateCollection {
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
      itemRewardCollections_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
