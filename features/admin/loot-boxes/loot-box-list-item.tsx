import { RarityBadge } from "@/features/UI/badges/rarity-badge";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { GiftIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

export type hashListCollection = {
  id: string;
  name: string;
  amount: number;
  hashList: {
    id: string;
    name: string;
    rawHashList: string;
  };
};

export type ItemCollection = {
  amount: number;
  id: string;
  name: string;
  imageUrl: string;
  item: {
    id: string;
    name: string;
    imageUrl: string;
    token: {
      id: string;
      mintAddress: string;
    };
  };
};

export type LootBox = {
  id: string;
  isEnabled: boolean;
  createdAt: string;
  name: string;
  description: string;
  rarity: {
    name: string;
    id: string;
  };
  rewardCollections?: {
    id: string;
    name: string;
    payoutChance?: number;
    hashListCollection: hashListCollection;
    itemCollection: ItemCollection;
    childRewardCollections?: {
      id: string;
      name: string;
      hashListCollection: hashListCollection;
      itemCollection: ItemCollection;
    }[];
  }[];
  imageUrl: string;
  costCollections?: {
    hashListCollection: hashListCollection;
    itemCollection: ItemCollection;
    id: string;
  }[];
  gateCollection?: {
    id: string;
    hashListCollection: hashListCollection;
    itemCollection: ItemCollection;
  }[];
  rewardCollections_aggregate: {
    aggregate: {
      count: number;
    };
  };
};

export const LootBoxesListItem = ({ lootBox }: { lootBox: LootBox }) => {
  return (
    <TableRow keyId={lootBox.id}>
      {!!lootBox?.imageUrl ? (
        <ImageWithFallback
          className="rounded-2xl"
          src={lootBox.imageUrl || ""}
          width={50}
          height={50}
          alt="Store image"
        />
      ) : (
        <div className="flex justify-center items-center w-14">
          <GiftIcon className="h-7 w-7 text-stone-300" />
        </div>
      )}
      <div className="flex items-center space-x-12">
        <div>{lootBox.name}</div>
        <RarityBadge rarity={lootBox.rarity} />
        <div className="flex items-center space-x-4">
          <div>Linked rewards:</div>
          <div>{lootBox.rewardCollections_aggregate?.aggregate?.count}</div>
        </div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm my-4"
        href={`/admin/loot-box/${lootBox.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
