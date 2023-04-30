import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GET_USERS {
    sodead_users(order_by: { createdAt: desc }) {
      id
      name
      email
      createdAt
      wallets {
        id
        address
      }
      primaryWallet {
        id
        address
      }
      accounts {
        id
        provider {
          id
          name
        }
        createdAt
        imageUrl
        username
        email
      }
      imageUrl
    }
    sodead_users_aggregate {
      aggregate {
        count
      }
    }
  }
`;
