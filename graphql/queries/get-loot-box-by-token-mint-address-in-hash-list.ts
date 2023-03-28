import { gql } from "@apollo/client";

export const GET_LOOT_BOX_BY_TOKEN_MINT_ADDRESS_IN_HASH_LIST = gql`
  query GET_LOOT_BOX_BY_TOKEN_MINT_ADDRESS_IN_HASH_LIST($mintAddress: jsonb!) {
    sodead_lootBoxes(
      where: {
        costCollections: {
          hashListCollection: {
            hashList: { rawHashList: { _contains: $mintAddress } }
          }
        }
      }
    ) {
      id
      name
      createdAt
    }
  }
`;
