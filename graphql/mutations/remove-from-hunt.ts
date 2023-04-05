import { gql } from "@apollo/client";

export const REMOVE_FROM_HUNT = gql`
  mutation MyMutation($mainCharacterId: uuid!, $activityId: uuid!) {
    delete_sodead_activityInstances(
      where: {
        mainCharacterId: { _eq: $mainCharacterId }
        activityId: { _eq: $activityId }
      }
    ) {
      affected_rows
    }
  }
`;
