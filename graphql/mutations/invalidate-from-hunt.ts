import { gql } from "@apollo/client";

export const INVALIDATE_FROM_HUNT = gql`
  mutation INVALIDATE_FROM_HUNT($mainCharacterId: uuid!, $activityId: uuid!) {
    update_sodead_activityInstances(
      where: {
        mainCharacterId: { _eq: $mainCharacterId }
        _and: {
          activityId: { _eq: $activityId }
          _and: { isComplete: { _eq: false } }
        }
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
