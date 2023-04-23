import { gql } from "@apollo/client";

export const ENABLE_DISABLE_LOOT_BOX = gql`
  mutation ENABLE_DISABLE_LOOT_BOX($id: uuid!, $isEnabled: Boolean!) {
    update_sodead_lootBoxes_by_pk(
      pk_columns: { id: $id }
      _set: { isEnabled: $isEnabled }
    ) {
      id
      isEnabled
    }
  }
`;
