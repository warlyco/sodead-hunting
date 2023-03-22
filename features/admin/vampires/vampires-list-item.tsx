import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import Image from "next/image";

import Link from "next/link";

export type Vampire = {
  id: string;
  name: string;
  createdAt: string;
  activeHunt: {
    id: string;
    name: string;
  };
  nft: {
    id: string;
    name: string;
    mintAddress: string;
    imageUrl: string;
  };
  stats: {
    id: string;
    value: number;
    baseStat: {
      id: string;
      name: string;
      abbreviation: string;
      min: number;
      max: number;
    };
  };
};

export const VampiresListItem = ({ vampire }: { vampire: Vampire }) => {
  return (
    <TableRow keyId={vampire.id}>
      <Image
        className="rounded-2xl"
        src={vampire?.nft?.imageUrl || ""}
        width={60}
        height={60}
        alt="vampire image"
      />
      <div className="my-4 flex items-center space-x-10">
        <div>{vampire.name}</div>
        <div>{getAbbreviatedAddress(vampire?.nft?.mintAddress)}</div>
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
