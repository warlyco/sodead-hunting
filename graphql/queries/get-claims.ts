import { gql } from "@apollo/client";

export const GET_CLAIMS = gql`
  query GET_CLAIMS {
    sodead_claims {
      amount
      claimTime
      id
      lootBox {
        id
        imageUrl
        name
      }
      user {
        id
        name
      }
    }
  }
`;
