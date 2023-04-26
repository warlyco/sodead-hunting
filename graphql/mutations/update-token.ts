import { gql } from "@apollo/client";

export const UPDATE_TOKEN = gql`
  mutation UPDATE_TOKEN($id: uuid!, $setInput: sodead_tokens_set_input!) {
    update_sodead_tokens_by_pk(pk_columns: { id: $id }, _set: $setInput) {
      id
      name
    }
  }
`;
