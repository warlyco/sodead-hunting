import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { copyTextToClipboard } from "@/utils/clipboard";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

import Link from "next/link";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  wallets: {
    id: string;
    address: string;
  }[];
  primaryWallet: {
    id: string;
    address: string;
  };
  accounts: {
    id: string;
    provider: {
      id: string;
      name: string;
    };
    createdAt: string;
    imageUrl: string;
    username: string;
    email: string;
  }[];
  imageUrl: string;
};

export const UsersListItem = ({ user }: { user: User }) => {
  return (
    <TableRow keyId={user.id}>
      <ImageWithFallback
        className="rounded-2xl"
        src={user.imageUrl || ""}
        width={60}
        height={60}
        alt="User image"
      />
      <div className="w-1/5 truncate">{formatDateTime(user.createdAt)}</div>
      <div className="w-1/5 truncate">{user.name}</div>
      {!!user.email && <div className="w-1/5 truncate">{user.email}</div>}
      <div className="w-1/4 truncate flex items-center space-x-2">
        {!!user.primaryWallet && (
          <>
            <div>{getAbbreviatedAddress(user.primaryWallet.address)}</div>
            <button
              onClick={() => copyTextToClipboard(user.primaryWallet.address)}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 text-stone-300" />
            </button>
          </>
        )}
      </div>
      <div className="w-1/4 truncate flex items-center space-x-2">
        {!!user.accounts?.[0] && (
          <>
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div>{user.accounts[0]?.provider.name}</div>
          </>
        )}
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/user/${user.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
