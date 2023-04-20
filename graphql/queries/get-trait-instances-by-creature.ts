import { gql } from "@apollo/client";

export const GET_TRAIT_INSTANCES_BY_CREATURE = gql`
  query GET_TRAIT_INSTANCES_BY_CREATURE($id: uuid!) {
    sodead_creatures {
      traitInstances {
        id
        trait {
          id
          name
        }
        value
      }
    }
  }
`;
