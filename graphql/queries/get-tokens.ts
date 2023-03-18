import { gql } from "@apollo/client";

export const GET_TOKENS = gql`
  query GET_TOKENS {
    sodead_providers {
      name
      id
    }
  }
`;
