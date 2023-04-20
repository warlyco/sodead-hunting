import { gql } from "@apollo/client";

export const GET_LOOT_BOX_PAYOUTS_BY_LOOT_BOX_ID = gql`
  query GET_LOOT_BOX_PAYOUTS_BY_LOOT_BOX_ID($id: uuid!) {
    sodead_payouts(
      where: { lootBoxId: { _eq: $id } }
      order_by: { createdAtWithTimezone: desc }
    ) {
      id
      amount
      txAddress
      lootBox {
        name
        id
      }
      name
      item {
        id
        name
      }
      token {
        name
        id
        mintAddress
        items {
          id
          name
          imageUrl
        }
      }
      wallet {
        id
        address
      }
      createdAtWithTimezone
    }
  }
`;
