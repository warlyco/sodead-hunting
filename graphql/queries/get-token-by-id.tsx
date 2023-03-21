import { gql } from "@apollo/client";

export const GET_TOKEN_BY_ID = gql`
  query GET_TOKEN_BY_ID($id: uuid!) {
    sodead_tokens_by_pk(id: $id) {
      id
      createdAt
      decimals
      imageUrl
      mintAddress
      name
      symbol
    }
  }
`;
