import { gql } from "@apollo/client";

export const GET_COSTS_BY_LOOT_BOX_ID = gql`
  query GET_COSTS_BY_LOOT_BOX_ID($id: uuid!) {
    sodead_lootBoxes_by_pk(id: $id) {
      costCollections {
        hashListCollection {
          amount
          hashListId
          hashList {
            rawHashList
          }
        }
      }
    }
  }
`;
