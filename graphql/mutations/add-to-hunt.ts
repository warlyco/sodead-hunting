import { gql } from "@apollo/client";

export const ADD_TO_HUNT = gql`
  mutation ADD_TO_HUNT(
    $activityId: uuid!
    $mainCharacterId: uuid!
    $startTime: timestamptz!
    $endTime: timestamptz!
    $isComplete: Boolean!
  ) {
    insert_sodead_activityInstances_one(
      object: {
        activityId: $activityId
        mainCharacterId: $mainCharacterId
        startTime: $startTime
        endTime: $endTime
        isComplete: $isComplete
      }
    ) {
      id
      mainCharacter {
        id
        name
      }
    }
  }
`;
