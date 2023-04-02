import { gql } from "@apollo/client";

export const GET_ENABLED_LOOT_BOXES_WITH_DETAILS = gql`
  query GET_ENABLED_LOOT_BOXES_WITH_DETAILS {
    sodead_lootBoxes(where: { isEnabled: { _eq: true } }) {
      id
      description
      createdAt
      name
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
      imageUrl
      costCollections {
        hashListCollection {
          name
          id
          amount
          hashList {
            id
            name
            rawHashList
          }
        }
        itemCollection {
          imageUrl
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
          hashList {
            id
            name
            rawHashList
          }
        }
        itemCollection {
          imageUrl
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
