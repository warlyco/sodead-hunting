import { gql } from "@apollo/client";

export const GET_LOOT_BOX_PAYOUTS_BY_WALLET_ADDRESS = gql`
  query GET_LOOT_BOX_PAYOUTS_BY_WALLET_ADDRESS(
    $lootBoxId: uuid!
    $walletAddress: String!
  ) {
    sodead_payouts(
      where: {
        lootBoxId: { _eq: $lootBoxId }
        _and: { wallet: { address: { _eq: $walletAddress } } }
      }
    ) {
      id
      amount
      lootBox {
        name
        id
      }
      name
      token {
        name
        id
      }
      wallet {
        id
      }
      createdAtWithTimezone
    }
  }
`;
