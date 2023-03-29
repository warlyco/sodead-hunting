import { gql } from "@apollo/client";

export const GET_LOOT_BOX_BY_TOKEN_MINT_ADDRESS_IN_HASH_LIST = gql`
  query GET_LOOT_BOX_BY_TOKEN_MINT_ADDRESS_IN_HASH_LIST($mintAddress: jsonb!) {
    sodead_lootBoxes(
      where: {
        costCollections: {
          hashListCollection: {
            hashList: { rawHashList: { _contains: $mintAddress } }
          }
        }
      }
    ) {
      id
      imageUrl
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
