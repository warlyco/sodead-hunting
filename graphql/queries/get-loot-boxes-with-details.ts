import { gql } from "@apollo/client";

export const LOOT_BOX_DETAILS_FRAGMENT = gql`
  fragment LootBoxDetails on sodead_lootBoxes {
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
      hashListCollection {
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
`;

export const GET_LOOT_BOXES_WITH_DETAILS = gql`
  query GET_LOOT_BOXES_WITH_DETAILS {
    ${LOOT_BOX_DETAILS_FRAGMENT}
    sodead_lootBoxes {
      ...LootBoxDetails
    }
  }
`;
