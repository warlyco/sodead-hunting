import { gql } from "@apollo/client";

export const ADD_TO_HUNT = gql`
  mutation ADD_TO_HUNT(
    $activityId: uuid!
    $mainCharacterId: uuid!
    $startTime: timestamptz!
    $endTime: timestamptz!
  ) {
    insert_sodead_activityInstances_one(
      object: {
        activityId: $activityId
        mainCharacterId: $mainCharacterId
        startTime: $startTime
        endTime: $endTime
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
