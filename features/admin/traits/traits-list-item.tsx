import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import Image from "next/image";

import Link from "next/link";

export interface Trait {
  id: string;
  createdAt: string;
  name: string;
  token: {
    id: string;
    name: string;
    mintAddress: string;
    imageUrl: string;
  };
  rarity: {
    id: string;
    name: string;
  };
  traitCategory: {
    id: string;
    name: string;
  };
}

export const TraitsListItem = ({ trait }: { trait: Trait }) => {
  return (
    <TableRow keyId={trait.id}>
      <Image
        className="rounded-2xl"
        src={trait?.token?.imageUrl || ""}
        width={50}
        height={50}
        alt="Store image"
      />
      <div className="flex items-center space-x-12">
        <div className="bg-stone-300 text-stone-900 p-1 rounded-lg uppercase text-sm">
          <div>{trait?.rarity?.name}</div>
        </div>
        <div>{trait.name}</div>
        <div>{trait?.traitCategory?.name}</div>
      </div>
      <div className="my-4 flex items-center space-x-4 px-8">
        {!!trait?.token?.mintAddress && (
          <>
            <div>Mint:</div>
            <div>{getAbbreviatedAddress(trait?.token?.mintAddress)}</div>
          </>
        )}
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/trait/${trait.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
