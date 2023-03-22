import { gql } from "@apollo/client";

export const GET_HUNT_BY_ID = gql`
  query GET_HUNT_BY_ID($id: uuid!) {
    sodead_hunts_by_pk(id: $id) {
      createdAt
      id
      name
      startTime
      endTime
      durationInSeconds
      imageUrl
      bannerImageUrl
      description
      maxConcurrentHunters
      maxTotalHunters
      huntInstances {
        vampire {
          id
        }
        id
      }
    }
  }
`;
