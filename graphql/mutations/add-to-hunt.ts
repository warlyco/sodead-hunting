import { gql } from "@apollo/client";

export const ADD_TO_HUNT = gql`
  mutation ADD_TO_HUNT($activityId: uuid!, $mainCharacterId: uuid!) {
    insert_sodead_activityInstances_one(
      object: { activityId: $activityId, mainCharacterId: $mainCharacterId }
    ) {
      id
      mainCharacter {
        id
        name
      }
    }
  }
`;
