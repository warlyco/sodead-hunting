import { TableRow } from "@/features/UI/tables/table-row";
import { getAbbreviatedAddress } from "@/utils/formatting";
import Image from "next/image";

import Link from "next/link";

export type Token = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  mintAddress: string;
  imageUrl: string;
  item: {
    id: string;
  };
};

export const TokensListItem = ({ token }: { token: Token }) => {
  return (
    <TableRow keyId={token.id}>
      <Image
        className="rounded-2xl"
        src={token.imageUrl || ""}
        width={60}
        height={60}
        alt="Store image"
      />
      <div className="my-4 w-1/4 flex items-center space-x-4">
        <div>{token.name}</div>
        <div>(${token.symbol})</div>
      </div>
      <div className="my-4 w-1/4 flex items-center space-x-4">
        <div>{getAbbreviatedAddress(token.mintAddress)}</div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/token/${token.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
