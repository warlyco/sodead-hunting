import { gql } from "@apollo/client";

export const GET_HUNTS = gql`
  query GET_HUNTS {
    sodead_activities(
      where: {
        category: { id: { _eq: "5ab3b7bd-a20b-469b-8274-62991c57c526" } }
      }
    ) {
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
