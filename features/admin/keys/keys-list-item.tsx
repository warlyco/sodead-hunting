import { TableRow } from "@/features/UI/tables/table-row";
import { formatNumberWithCommas } from "@/utils/formatting";
import { KeyIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export interface Key {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  lootBoxKeys: {
    id: string;
    keyAmount: number;
    lootBox: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }[];
}

export const KeysListItem = ({ keyItem }: { keyItem: Key }) => {
  return (
    <TableRow keyId={keyItem.id}>
      {!!keyItem.imageUrl ? (
        <Image
          className="rounded-2xl"
          src={keyItem.imageUrl || ""}
          width={80}
          height={80}
          alt="Key image"
        />
      ) : (
        <KeyIcon className="h-6 w-6" />
      )}
      <div className="my-4 flex items-center space-x-12 w-1/4 whitespace-nowrap">
        <div>{keyItem.name}</div>
      </div>
      {!!keyItem.lootBoxKeys?.[0] && (
        <div className="space-x-4 flex justify-center w-full">
          {formatNumberWithCommas(keyItem.lootBoxKeys[0].keyAmount)}x to open{" "}
          {keyItem.lootBoxKeys[0].lootBox?.name}
        </div>
      )}
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/keyItem/${keyItem.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
