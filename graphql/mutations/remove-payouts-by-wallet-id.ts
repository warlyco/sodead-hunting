import { gql } from "@apollo/client";

export const REMOVE_PAYOUTS_BY_WALLET_ID = gql`
  mutation REMOVE_PAYOUTS_BY_WALLET_ID($id: uuid!) {
    delete_sodead_payouts(where: { walletId: { _eq: $id } }) {
      affected_rows
      returning {
        id
        wallet {
          id
        }
      }
    }
  }
`;
