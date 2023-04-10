import { gql } from "@apollo/client";

export const GET_PAYOUTS_BY_CREATURE_ID = gql`
  query GET_PAYOUTS_BY_CREATURE_ID($id: uuid!) {
    sodead_payouts(
      where: { activityInstances: { mainCharacterId: { _eq: $id } } }
      order_by: { createdAtWithTimezone: desc }
    ) {
      amount
      id
      createdAt
      createdAtWithTimezone
      token {
        id
        name
        mintAddress
        items {
          id
          name
          imageUrl
        }
        imageUrl
        creatures {
          id
          name
          imageUrl
        }
      }
    }
  }
`;
