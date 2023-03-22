import { gql } from "@apollo/client";

export const GET_VAMPIRES = gql`
  query GET_VAMPIRES {
    sodead_vampires {
      createdAt
      id
      name
      huntInstances {
        id
        startTime
        endTime
        hunt {
          id
          name
        }
      }
      imageUrl
      rankInCollection
      rarity {
        id
        name
      }
      stats {
        id
        value
        baseStat {
          name
          id
        }
      }
      token {
        id
        mintAddress
        name
      }
    }
  }
`;
