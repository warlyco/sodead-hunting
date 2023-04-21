import { gql } from "@apollo/client";

export const GET_WALLET_BY_ADDRESS = gql`
  query GET_WALLET_BY_ADDRESS($address: String!) {
    sodead_wallets(where: { address: { _eq: $address } }) {
      address
      id
      user {
        id
        name
        imageUrl
        email
        accounts {
          id
        }
      }
    }
  }
`;
