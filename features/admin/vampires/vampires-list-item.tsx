import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import Image from "next/image";

import Link from "next/link";

export type Vampire = {
  createdAt: string;
  id: string;
  name: string;
  huntInstances: {
    id: string;
    startTime: string;
    endTime: string;
    hunt: {
      id: string;
      name: string;
    };
  };
  imageUrl: string;
  rankInCollection: number;
  rarity: {
    id: string;
    name: string;
  };
  stats: {
    id: string;
    value: number;
    baseStat: {
      name: string;
      id: string;
    };
  };
  token: {
    id: string;
    mintAddress: string;
    name: string;
  };
};

export const VampiresListItem = ({ vampire }: { vampire: Vampire }) => {
  return (
    <TableRow keyId={vampire.id}>
      <ImageWithFallback
        className="rounded-2xl"
        src={vampire?.imageUrl || ""}
        width={60}
        height={60}
        alt="vampire image"
      />
      <div className="my-4 flex items-center space-x-10">
        <div>{vampire.name}</div>
        <div>{getAbbreviatedAddress(vampire?.token?.mintAddress)}</div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/vampire/${vampire.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
