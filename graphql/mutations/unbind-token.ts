import { gql } from "@apollo/client";

export const UNBIND_TOKEN = gql`
  mutation UNBIND_TOKEN($id: uuid!) {
    update_sodead_tokens_by_pk(
      pk_columns: { id: $id }
      _set: { itemId: null }
    ) {
      id
      name
      mintAddress
    }
  }
`;
