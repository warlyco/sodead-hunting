import { gql } from "@apollo/client";

export const GET_VAMPIRES_WITHOUT_TRAIT_HASH = gql`
  query GET_VAMPIRES_WITHOUT_TRAIT_HASH {
    sodead_creatures(
      where: {
        creatureCategoryId: { _eq: "28ea2cc8-7fbc-4599-a93d-73a34f00ddfe" }
        _and: { traitCombinationHash: { _is_null: true } }
      }
      order_by: { id: desc }
    ) {
      createdAt
      id
      name
      mainCharacterActivityInstances {
        isComplete
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
