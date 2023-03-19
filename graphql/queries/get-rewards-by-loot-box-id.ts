import { gql } from "@apollo/client";

export const GET_REWARDS_BY_LOOT_BOX_ID = gql`
  query GET_REWARDS_BY_LOOT_BOX_ID($lootBoxId: uuid_comparison_exp = {}) {
    sodead_rewardCollectionItems(where: { lootBoxId: $lootBoxId }) {
      rewards {
        amount
        id
        imageUrl
        name
        token {
          id
          name
          mintAddress
          imageUrl
        }
      }
      id
      createdAt
      lootBox {
        id
        name
        rarity {
          name
          id
        }
      }
    }
  }
`;
