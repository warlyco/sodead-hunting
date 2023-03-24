import { gql } from "@apollo/client";

export const ADD_WALLET = gql`
  mutation ADD_WALLET($address: String = "", $userId: uuid = "") {
    insert_sodead_wallets_one(object: { address: $address, userId: $userId }) {
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
