import { gql } from "@apollo/client";

export const GET_VAMPIRES = gql`
  query GET_VAMPIRES {
    sodead_creatures(
      where: {
        creatureCategoryId: { _eq: "28ea2cc8-7fbc-4599-a93d-73a34f00ddfe" }
      }
    ) {
      createdAt
      id
      name
      mainCharacterActivityInstances {
        id
        startTime
        endTime
        activity {
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
      statInstances {
        id
        value
        baseStat {
          id
          name
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
