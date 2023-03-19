import { gql } from "@apollo/client";

export const GET_COMMUNITIES = gql`
  query GET_COMMUNITIES {
    sodead_communities {
      imageUrl
      name
      createdAt
      id
    }
  }
`;
