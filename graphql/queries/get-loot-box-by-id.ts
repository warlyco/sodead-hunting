import { gql } from "@apollo/client";

export const GET_LOOT_BOX_BY_ID = gql`
  query GET_LOOT_BOX_BY_ID($id: uuid!) {
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
        name
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
        childRewardCollections {
          id
          name
          itemCollection {
            id
            amount
            name
            item {
              name
              id
              token {
                id
                mintAddress
              }
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
      itemRewardCollections_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
