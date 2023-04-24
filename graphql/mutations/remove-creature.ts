import { gql } from "@apollo/client";

export const REMOVE_CREATURE = gql`
  mutation REMOVE_CREATURE($id: uuid!) {
    delete_sodead_creatures_by_pk(id: $id) {
      id
    }
  }
`;
