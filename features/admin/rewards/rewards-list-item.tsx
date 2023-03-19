import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { GiftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export interface Reward {
  id: string;
  createdAt: string;
  name: string;
  token: {
    id: string;
    name: string;
    mintAddress: string;
    imageUrl: string;
  };
  nft: {
    id: string;
    name: string;
    mintAddress: string;
    imageUrl: string;
  };
  trait: {
    id: string;
    name: string;
    rarity: {
      id: string;
      name: string;
    };
    token: {
      id: string;
      name: string;
      mintAddress: string;
      imageUrl: string;
    };
  };
  wallet: {
    id: string;
    address: string;
  };
}

export const RewardsListItem = ({ reward }: { reward: Reward }) => {
  return (
    <TableRow keyId={reward.id}>
      {reward?.token?.imageUrl ? (
        <Image
          className="rounded-2xl"
          src={reward?.token?.imageUrl || ""}
          width={50}
          height={50}
          alt="Store image"
        />
      ) : (
        <div className="flex justify-center items-center w-12">
          <GiftIcon className="h-7 w-7 text-stone-300" />
        </div>
      )}
      <div className="flex items-center space-x-12">
        <div>{reward.name}</div>
      </div>
      <div className="my-4 flex items-center space-x-4 px-8">
        {!!reward?.token?.mintAddress && (
          <>
            <div>Mint:</div>
            <div>{getAbbreviatedAddress(reward?.token?.mintAddress)}</div>
          </>
        )}
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/reward/${reward.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
