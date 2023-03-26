import { gql } from "@apollo/client";

export const GET_HASH_LIST_BY_ID = gql`
  query GET_HASH_LIST_BY_ID($id: uuid!) {
    sodead_hashLists(where: { id: { _eq: $id } }) {
      id
      name
      rawHashList
      tokens {
        id
        name
        mintAddress
      }
    }
  }
`;
