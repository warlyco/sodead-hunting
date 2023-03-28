import { gql } from "@apollo/client";

export const GET_HASH_LIST_BY_TOKEN_MINT_ADDRESS = gql`
  query GET_HASH_LIST_BY_TOKEN_MINT_ADDRESS($mintAddress: jsonb!) {
    sodead_hashLists(where: { rawHashList: { _contains: $mintAddress } }) {
      id
      name
    }
  }
`;
