import { gql } from "@apollo/client";

export const REMOVE_PRIMARY_WALLET = gql`
  mutation REMOVE_PRIMARY_WALLET($id: uuid!) {
    update_sodead_users_by_pk(
      pk_columns: { id: $id }
      _set: { primaryWalletId: null }
    ) {
      name
      id
    }
  }
`;
