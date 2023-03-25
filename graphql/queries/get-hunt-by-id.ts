import { gql } from "@apollo/client";

export const GET_HUNT_BY_ID = gql`
  query MyQuery($id: uuid!) {
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
