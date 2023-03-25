import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation ADD_USER($name: String!) {
    insert_sodead_users_one(object: { name: $name }) {
      id
      name
    }
  }
`;
