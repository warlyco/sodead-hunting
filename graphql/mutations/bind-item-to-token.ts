import { gql } from "@apollo/client";

export const BIND_ITEM_TO_TOKEN = gql`
  mutation BIND_ITEM_TO_TOKEN($mintAddress: String!, $itemId: uuid!) {
    update_sodead_tokens(
      where: { mintAddress: { _eq: $mintAddress } }
      _set: { itemId: $itemId }
    ) {
      returning {
        id
        name
        item {
          id
          name
        }
        mintAddress
      }
    }
  }
`;
