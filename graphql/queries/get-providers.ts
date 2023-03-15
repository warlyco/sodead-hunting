import { gql } from "@apollo/client";

export const GET_PROVIDERS = gql`
  query GET_PROVIDERS {
    sodead_providers {
      name
      id
    }
  }
`;
