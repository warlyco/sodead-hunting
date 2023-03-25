import { gql } from "@apollo/client";

export const GET_ACCOUNT_BY_ID = gql`
  query GET_ACCOUNT_BY_ID($id: uuid!) {
    sodead_accounts_by_pk(id: $id) {
      email
      id
      imageUrl
      username
      provider {
        id
        name
      }
      user {
        email
        id
        imageUrl
        name
        primaryWallet {
          id
          address
        }
      }
    }
  }
`;
