import { gql } from "@apollo/client";

export const GET_TRAIT_COMBINATION_HASHES = gql`
  query GET_TRAIT_COMBINATION_HASHES {
    sodead_creatures(order_by: { id: desc }) {
      id
      traitCombinationHash
    }
  }
`;
