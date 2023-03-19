import { gql } from "@apollo/client";

export const GET_USER_BY_ID = gql`
  query GET_USER_BY_ID($id: uuid!) {
    sodead_users_by_pk(id: $id) {
      email
      id
      name
      imageUrl
      wallets {
        address
        id
      }
    }
  }
`;
