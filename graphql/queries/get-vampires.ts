import { gql } from "@apollo/client";

export const GET_VAMPIRES = gql`
  query GET_VAMPIRES {
    sodead_vampires {
      createdAt
      id
      name
      activeHunt {
        id
        name
      }
      nft {
        id
        mintAddress
        imageUrl
        name
      }
      stats {
        id
        value
        baseStat {
          id
          abbreviation
          max
          min
          name
        }
      }
    }
  }
`;
