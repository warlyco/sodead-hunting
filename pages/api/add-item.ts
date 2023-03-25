// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import request from "graphql-request";
import type { NextApiRequest, NextApiResponse } from "next";
import { ADD_ITEM } from "@/graphql/mutations/add-item";

export type Item = {
  costs: {
    amount: number;
    id: string;
    createdAt: string;
    token: {
      id: string;
      name: string;
      mintAddress: string;
    };
    item: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
  baseStatModifier: {
    id: string;
    name: string;
    effectAmount: number;
    affectedBaseStat: {
      name: string;
      id: string;
      max: number;
      min: number;
    };
  };
  imageUrl: string;
  id: string;
  createdAt: string;
  isConsumable: boolean;
  isCraftable: boolean;
  name: string;

  description: string;
  category: {
    id: string;
    name: string;
    parentCategory: {
      name: string;
      id: string;
    };
    childCategories: {
      id: string;
      name: string;
    };
  };
  itemCollections: {
    name: string;
    id: string;
    imageUrl: string;
  };
  token: {
    id: string;
    mintAddress: string;
  };
};

type Data =
  | Item
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    imageUrl,
    isConsumable = false,
    isCraftable = false,
    name,
    itemCategoryId,
    description,
  } = req.body;

  if (!name) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  try {
    const { insert_sodead_items_one }: { insert_sodead_items_one: Data } =
      await request({
        url: process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT!,
        document: ADD_ITEM,
        variables: {
          imageUrl,
          name,
          isConsumable,
          isCraftable,
          itemCategoryId,
          description,
        },
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });

    console.log("insert_sodead_items_one: ", insert_sodead_items_one);

    res.status(200).json(insert_sodead_items_one);
  } catch (error) {
    res.status(500).json({ error });
  }
}
