import { gql } from "@apollo/client";

export const REMOVE_USER = gql`
  mutation REMOVE_USER($id: uuid!) {
    delete_sodead_users_by_pk(id: $id) {
      id
    }
  }
`;
