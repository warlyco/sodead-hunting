import { gql } from "@apollo/client";

export const GET_ACTIVE_HUNTS = gql`
  query GET_ACTIVE_HUNTS {
    sodead_activities(
      where: {
        category: { id: { _eq: "5ab3b7bd-a20b-469b-8274-62991c57c526" } }
        _and: { isActive: { _eq: true } }
      }
    ) {
      createdAt
      id
      isActive
      name
      startTime
      endTime
      durationInSeconds
      imageUrl
      bannerImageUrl
      description
      maxTotalParticipants
      maxConcurrentParticipants
      gateCollections {
        id
        traitCollection {
          id
          value
          name
          trait {
            id
            name
          }
        }
      }
      rewardCollections {
        id
        name
        itemCollection {
          id
          name
          imageUrl
          amount
          item {
            id
            name
            imageUrl
          }
        }
      }
      instances {
        mainCharacter {
          id
          name
        }
        id
        mount {
          id
          name
        }
      }
      lootBox {
        id
        name
      }
    }
  }
`;
