import { gql } from "@apollo/client";

export const GET_BURN_COUNT = gql`
  query GET_BURN_COUNT($walletId: uuid!, $lootBoxId: uuid!) {
    sodead_burnCounts(
      where: { lootBoxId: { _eq: $lootBoxId }, walletId: { _eq: $walletId } }
    ) {
      id
      currentCount
    }
  }
`;
