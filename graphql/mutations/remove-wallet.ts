import { gql } from "@apollo/client";

export const REMOVE_WALLET = gql`
  mutation REMOVE_WALLET($id: uuid!) {
    delete_sodead_wallets_by_pk(id: $id) {
      id
    }
  }
`;
