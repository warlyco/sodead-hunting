import { gql } from "@apollo/client";

export const UPDATE_CREATURE = gql`
  mutation UPDATE_CREATURE(
    $id: uuid = ""
    $setInput: sodead_creatures_set_input
  ) {
    update_sodead_creatures_by_pk(pk_columns: { id: $id }, _set: $setInput) {
      id
      name
    }
  }
`;
