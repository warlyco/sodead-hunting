import { gql } from "@apollo/client";

export const GET_COMMUNITIES = gql`
  query GET_COMMUNITIES {
    sodead_communities {
      imageUrl
      name
      createdAt
      id
      nftCollections {
        name
        imageUrl
        id
      }
      nftCollections_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;
