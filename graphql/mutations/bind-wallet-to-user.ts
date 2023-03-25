import { gql } from "@apollo/client";

export const BIND_WALLET_TO_USER = gql`
  mutation BIND_WALLET_TO_USER($walletId: uuid!, $userId: uuid!) {
    update_sodead_wallets_by_pk(
      pk_columns: { id: $walletId }
      _set: { userId: $userId }
    ) {
      id
      address
    }
    update_sodead_users_by_pk(
      pk_columns: { id: $userId }
      _set: { primaryWalletId: $walletId }
    ) {
      id
      name
      wallets {
        id
        address
      }
    }
  }
`;
