import { gql } from "@apollo/client";

export const GET_TRAIT_BY_NAME = gql`
  query GET_TRAIT_BY_NAME($name: String!) {
    sodead_traits(where: { name: { _eq: $name } }) {
      id
      name
    }
  }
`;
