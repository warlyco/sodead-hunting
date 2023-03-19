import { gql } from "@apollo/client";

export const GET_LOOT_BOXES_WITH_REWARDS = gql`
  query GET_LOOT_BOXES {
    sodead_lootBoxes {
      id
      createdAt
      name
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
      rewardCollectionItems {
        reward {
          amount
          id
          name
          token {
            mintAddress
            name
            id
          }
          wallet {
            address
            id
          }
        }
        id
        parentReward {
          amount
          id
          imageUrl
          name
          token {
            mintAddress
            name
          }
        }
        payoutProbability
      }
      rewardCollectionItems_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
