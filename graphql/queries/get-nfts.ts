import { gql } from "@apollo/client";

export const GET_NFTS = gql`
  query GET_NFTS {
    sodead_nfts {
      createdAt
      mintAddress
      id
      rankInCollection
      imageUrl
      name
      nftCollection {
        id
        name
        associatedCommunity {
          id
          name
        }
      }
      vampire {
        id
        name
      }
    }
  }
`;
