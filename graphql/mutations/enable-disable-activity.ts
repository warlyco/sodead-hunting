import { gql } from "@apollo/client";

export const ENABLE_DISABLE_ACTIVITY = gql`
  mutation ENABLE_DISABLE_ACTIVITY($id: uuid!, $isActive: Boolean!) {
    update_sodead_activities_by_pk(
      pk_columns: { id: $id }
      _set: { isActive: $isActive }
    ) {
      id
      isActive
    }
  }
`;
