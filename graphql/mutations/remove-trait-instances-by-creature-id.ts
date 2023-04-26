import { gql } from "@apollo/client";

export const REMOVE_TRAIT_INSTANCES_BY_CREATURE_ID = gql`
  mutation REMOVE_TRAIT_INSTANCES_BY_CREATURE_ID($id: uuid) {
    delete_sodead_traitInstances(where: { creatureId: { _eq: $id } }) {
      affected_rows
      returning {
        id
        trait {
          name
        }
        value
      }
    }
  }
`;
