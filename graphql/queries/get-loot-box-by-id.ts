import { gql } from "@apollo/client";

export const GET_LOOT_BOX_BY_ID = gql`
  query GET_LOOT_BOX_BY_ID($id: uuid!) {
    sodead_lootBoxes_by_pk(id: $id) {
      id
      description
      createdAt
      name
      imageUrl
      rarity {
        name
        id
      }
      rewardCollections {
        id
        payoutChance
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
      costCollections {
        hashListCollection {
          name
          id
          amount
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
      rewardCollections_aggregate {
        aggregate {
          count
        }
      }
      gateCollections {
        id
        hashListCollection {
          name
          id
          amount
          imageUrl
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
    }
  }
`;
