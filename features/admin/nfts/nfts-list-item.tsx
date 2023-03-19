import { RarityBadge } from "@/features/UI/badges/rarity-badge";
import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export interface Nft {
  id: string;
  createdAt: string;
  name: string;
  mintAddress: string;
  imageUrl: string;
  nftCollection: {
    id: string;
    name: string;
    associatedCommunity: {
      id: string;
      name: string;
    };
  };
  vampire: {
    id: string;
    name: string;
  };
}

export const NftsListItem = ({ nft }: { nft: Nft }) => {
  return (
    <TableRow keyId={nft.id}>
      {!!nft?.imageUrl ? (
        <Image
          className="rounded-2xl"
          src={nft.imageUrl || ""}
          width={50}
          height={50}
          alt="Store image"
        />
      ) : (
        <div className="flex justify-center items-center w-14">
          <PhotoIcon className="h-7 w-7 text-stone-300" />
        </div>
      )}
      <div className="flex items-center space-x-12">
        <div>{nft.name}</div>
        <div className="my-4 w-1/4 flex items-center space-x-4">
          {nft.mintAddress.substring(0, 6)}...
          {nft.mintAddress.substring(nft.mintAddress.length - 6)}
        </div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm my-4"
        href={`/admin/loot-box/${nft.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
