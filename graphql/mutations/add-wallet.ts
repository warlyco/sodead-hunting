import { gql } from "@apollo/client";

export const ADD_WALLET = gql`
  mutation ADD_WALLET($address: String!) {
    insert_sodead_wallets_one(object: { address: $address }) {
      address
      id
      user {
        email
        id
        name
        imageUrl
      }
    }
  }
`;
