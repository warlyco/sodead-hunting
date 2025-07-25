import { gql } from "@apollo/client";

export const GET_HUNT_BY_ID = gql`
  query GET_HUNT_BY_ID($id: uuid!) {
    sodead_activities_by_pk(id: $id) {
      createdAt
      id
      name
      startTime
      endTime
      durationInSeconds
      imageUrl
      bannerImageUrl
      description
      maxTotalParticipants
      maxConcurrentParticipants
      isActive
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
      restrictionCollections {
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
            token {
              mintAddress
              id
            }
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
