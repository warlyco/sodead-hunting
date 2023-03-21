import { gql } from "@apollo/client";

export const UPDATE_ITEM = gql`
  mutation UPDATE_ITEM($id: uuid!, $setInput: sodead_items_set_input!) {
    update_sodead_items_by_pk(pk_columns: { id: $id }, _set: $setInput) {
      id
      description
      imageUrl
      isConsumable
      isCraftable
      name
    }
  }
`;
