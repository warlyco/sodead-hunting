import { gql } from "@apollo/client";

export const LOG_ERROR = gql`
  mutation LOG_ERROR(
    $code: Int!
    $message: String!
    $rawError: String!
    $burnTxAddress: String!
    $walletId: uuid!
  ) {
    insert_sodead_errorInstances_one(
      object: {
        code: $code
        message: $message
        rawError: $rawError
        burnTxAddress: $burnTxAddress
        walletId: $walletId
      }
    ) {
      code
      id
      message
      rawError
    }
  }
`;
