import { gql } from "@apollo/client";

export const REMOVE_ACCOUNT = gql`
  mutation REMOVE_ACCOUNT($id: uuid!) {
    delete_sodead_accounts_by_pk(id: $id) {
      id
    }
  }
`;
