import { gql } from "@apollo/client";

export const UPDATE_USER_BY_WALLET_ADDRESS = gql`
  mutation MyMutation($address: String!, $setInput: sodead_users_set_input!) {
    update_sodead_users(
      where: { wallets: { address: { _eq: $address } } }
      _set: $setInput
    ) {
      returning {
        id
        name
        claimingTimeStamp
      }
    }
  }
`;
