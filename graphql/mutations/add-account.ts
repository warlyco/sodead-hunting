import { gql } from "@apollo/client";

export const ADD_ACCOUNT = gql`
  mutation ADD_ACCOUNT(
    $email: String!
    $imageUrl: String!
    $providerId: uuid!
    $providerAccountId: String!
    $username: String!
  ) {
    insert_sodead_accounts_one(
      object: {
        email: $email
        imageUrl: $imageUrl
        providerId: $providerId
        providerAccountId: $providerAccountId
        username: $username
      }
    ) {
      id
      email
      imageUrl
      provider {
        name
        id
      }
      username
      user {
        email
        id
        name
        imageUrl
      }
    }
  }
`;
