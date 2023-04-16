import { gql } from "@apollo/client";

export const GET_PAYOUTS_BY_WALLET_ID = gql`
  query GET_PAYOUTS_BY_WALLET_ID($id: uuid!) {
    GET_PAYOUTS_BY_WALLET_ID(where: { walletId: { _eq: $id } }) {
      id
      name
      wallet {
        id
      }
    }
  }
`;
