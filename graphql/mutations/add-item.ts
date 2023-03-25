import { gql } from "@apollo/client";

export const ADD_ITEM = gql`
  mutation ADD_ITEM(
    $imageUrl: String = ""
    $isConsumable: Boolean!
    $isCraftable: Boolean!
    $itemCategoryId: uuid!
    $name: String!
    $description: String = ""
  ) {
    insert_sodead_items_one(
      object: {
        imageUrl: $imageUrl
        isConsumable: $isConsumable
        isCraftable: $isCraftable
        itemCategoryId: $itemCategoryId
        name: $name
        description: $description
      }
    ) {
      id
      imageUrl
      isConsumable
      isCraftable
      description
      category {
        id
        name
      }
      name
    }
  }
`;
