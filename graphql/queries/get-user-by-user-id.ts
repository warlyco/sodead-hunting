import { gql } from "@apollo/client";

export const GET_USER_BY_ID = gql`
  query GET_USER_BY_ID($id: uuid!) {
    sodead_users_by_pk(id: $id) {
      accounts {
        id
        email
        provider {
          id
          name
        }
      }
      claims {
        amount
        id
        txAddress
      }
      email
      id
      imageUrl
      name
      primaryWallet {
        address
        id
      }
      wallets {
        id
        address
      }
    }
  }
`;
