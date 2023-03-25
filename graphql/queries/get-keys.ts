import { gql } from "@apollo/client";

export const GET_KEYS = gql`
  query GET_KEYS {
    sodead_items(
      where: {
        category: { id: { _eq: "e1e37421-14a2-400b-aaa3-666cadacab20" } }
      }
    ) {
      id
      imageUrl
      token {
        id
        mintAddress
      }
      name
      description
    }
  }
`;
