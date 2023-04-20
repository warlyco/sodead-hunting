import { gql } from "@apollo/client";

export const GET_TRAIT_INSTANCES_BY_CREATURE_VIA_NFT_COLLECTION_ID = gql`
  query MyQuery($id: uuid!) {
    sodead_creatures(where: { token: { nftCollectionId: { _eq: $id } } }) {
      traitInstances {
        id
        trait {
          id
          name
        }
        value
      }
    }
  }
`;
