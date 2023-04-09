import { gql } from "@apollo/client";

export const REMOVE_FROM_HUNT = gql`
  mutation REMOVE_FROM_HUNT($mainCharacterId: uuid!, $activityId: uuid!) {
    update_sodead_activityInstances(
      where: {
        mainCharacterId: { _eq: $mainCharacterId }
        _and: { activityId: { _eq: $activityId } }
      }
      _set: { isComplete: true }
    ) {
      returning {
        id
        isComplete
      }
    }
  }
`;
