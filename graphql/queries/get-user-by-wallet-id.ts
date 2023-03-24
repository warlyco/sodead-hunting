import { gql } from "@apollo/client";

export const GET_USER_BY_WALLET_ID = gql`
  query GET_USER_BY_WALLET_ID($walletId: uuid!) {
    sodead_users(where: { wallets: { id: { _in: [$walletId] } } }) {
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
