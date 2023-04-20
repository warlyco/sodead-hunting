import { RarityBadge } from "@/features/UI/badges/rarity-badge";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { Payout } from "@/pages/profile/[id]";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { GiftIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

export const PayoutListItem = ({ payout }: { payout: Payout }) => {
  return (
    <TableRow keyId={payout.id}>
      <div className="flex items-center space-x-12 justify-between w-full">
        <div>{formatDateTime(payout.createdAtWithTimezone)}</div>
        <div className="flex items-center space-x-4">
          <div>{payout.item.name}</div>
        </div>
        <div className="flex flex-col items-center space-x-4">
          <div>Token:</div>
          <div>{getAbbreviatedAddress(payout.token.mintAddress)}</div>
        </div>
        <div className="flex flex-col items-center space-x-4">
          <div>Wallet:</div>
          <div>{getAbbreviatedAddress(payout.wallet.address)}</div>
        </div>
        <div className="flex flex-col items-center space-x-4">
          <div>Tx:</div>
          <a
            className="text-xl underline"
            href={`https://explorer.solana.com/tx/${payout.txAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            {getAbbreviatedAddress(payout.txAddress)}
          </a>
        </div>
      </div>
      <div className="flex flex-grow"></div>
    </TableRow>
  );
};
