import { gql } from "@apollo/client";

export const GET_HUNTS = gql`
  query GET_HUNTS {
    sodead_hunts {
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
