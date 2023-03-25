import { gql } from "@apollo/client";

export const GET_USER_BY_WALLET_ADDRESS = gql`
  query GET_USER_BY_WALLET_ADDRESS($address: String!) {
    sodead_users(where: { wallets: { address: { _eq: $address } } }) {
      email
      id
      imageUrl
      name
      primaryWallet {
        address
        id
      }
      accounts {
        id
        email
        imageUrl
        provider {
          id
          name
        }
        username
        providerAccountId
      }
    }
  }
`;
