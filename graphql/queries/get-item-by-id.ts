import { gql } from "@apollo/client";

export const GET_ITEM_BY_ID = gql`
  query GET_ITEM_BY_ID($id: uuid!) {
    sodead_items_by_pk(id: $id) {
      description
      costs {
        amount
        id
        createdAt
        token {
          id
          name
          mintAddress
        }
        item {
          id
          name
          imageUrl
        }
      }
      baseStatModifier {
        id
        name
        effectAmount
        affectedBaseStat {
          name
          id
          max
          min
        }
      }
      imageUrl
      id
      isConsumable
      isCraftable
      name
      itemCategory {
        id
        name
      }
      nfts {
        id
        mintAddress
      }
      tokens {
        id
        mintAddress
      }
    }
  }
`;
