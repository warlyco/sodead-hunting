import { gql } from "@apollo/client";

export const ADD_ITEM = gql`
  mutation MyMutation(
    $imageUrl: String = ""
    $isConsumable: Boolean!
    $isCraftable: Boolean!
    $itemCategoryId: uuid!
    $name: String!
  ) {
    insert_sodead_items_one(
      object: {
        imageUrl: $imageUrl
        isConsumable: $isConsumable
        isCraftable: $isCraftable
        itemCategoryId: $itemCategoryId
        name: $name
      }
    ) {
      id
      imageUrl
      isConsumable
      isCraftable
      itemCategory {
        id
        name
      }
      name
    }
  }
`;
