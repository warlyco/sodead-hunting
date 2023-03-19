import { RarityBadge } from "@/features/UI/badges/rarity-badge";
import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { GiftIcon, LinkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export interface LootBox {
  id: string;
  createdAt: string;
  name: string;
  keys: {
    id: string;
    keyAmount: number;
    key: {
      id: string;
      name: string;
    };
  };
  rarity: {
    id: string;
    name: string;
  };
  imageUrl: string;
  rewardCollectionItems_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const LootBoxesListItem = ({ lootBox }: { lootBox: LootBox }) => {
  return (
    <TableRow keyId={lootBox.id}>
      {!!lootBox?.imageUrl ? (
        <Image
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
          <div>{lootBox.rewardCollectionItems_aggregate?.aggregate?.count}</div>
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
