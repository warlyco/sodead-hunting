import { gql } from "@apollo/client";

export const GET_REWARDS = gql`
  query GET_REWARDS {
    sodead_rewards {
      amount
      createdAt
      id
      imageUrl
      name
      nft {
        id
        imageUrl
        mintAddress
        name
      }
      token {
        id
        name
        mintAddress
        imageUrl
      }
      trait {
        name
        id
        rarity {
          id
          name
        }
        token {
          id
          imageUrl
          mintAddress
          name
        }
      }
      wallet {
        id
        address
      }
    }
  }
`;
