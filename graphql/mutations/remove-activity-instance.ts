import { gql } from "@apollo/client";

export const REMOVE_ACTIVITY_INSTANCE = gql`
  mutation REMOVE_ACTIVITY_INSTANCE($id: uuid!) {
    delete_sodead_activityInstances_by_pk(id: $id) {
      id
    }
  }
`;
