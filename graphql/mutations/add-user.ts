import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation ADD_USER(
    $accountId: uuid!
    $primaryWalletId: uuid!
    $email: String!
    $imageUrl: String!
    $name: String!
  ) {
    insert_sodead_users_one(
      object: {
        accounts: { data: { id: $accountId } }
        primaryWalletId: $primaryWalletId
        email: $email
        imageUrl: $imageUrl
        name: $name
        wallets: { data: { id: $primaryWalletId } }
      }
    ) {
      id
      name
      imageUrl
      email
      primaryWallet {
        address
        id
      }
    }
  }
`;
