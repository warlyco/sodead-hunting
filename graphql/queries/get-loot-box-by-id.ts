import { gql } from "@apollo/client";

export const GET_LOOT_BOX_BY_ID = gql`
  query GET_LOOT_BOX_BY_ID($id: uuid!) {
    sodead_lootBoxes_by_pk(id: $id) {
      id
      createdAt
      description
      name
      rarity {
        name
        id
      }
      rewardCollections {
        id
        name
        hashListCollection {
          amount
          name
          id
          hashList {
            id
            name
            rawHashList
          }
        }
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
          hashListCollection {
            amount
            name
            id
            hashList {
              id
              name
              rawHashList
            }
          }
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
      costCollections {
        hashListCollection {
          amount
          name
          id
          imageUrl
          hashList {
            id
            name
            rawHashList
          }
        }
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
      gateCollections {
        id
        hashListCollection {
          amount
          name
          id
          hashList {
            id
            name
            rawHashList
          }
        }
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
      rewardCollections_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
