import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GET_USERS {
    sodead_users {
      id
      name
      email
      createdAt
      wallets {
        id
        address
      }
    }
  }
`;
