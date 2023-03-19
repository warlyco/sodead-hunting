import { gql } from "@apollo/client";

export const GET_NFTS_BY_COLLECTION_ID = gql`
  query GET_NFTS_BY_COLLECTION_ID($nftCollectionId: uuid!) {
    sodead_nfts(where: { nftCollectionId: { _eq: $nftCollectionId } }) {
      id
      imageUrl
      mintAddress
      name
      wallet {
        id
        address
        user {
          id
          name
        }
      }
    }
  }
`;
