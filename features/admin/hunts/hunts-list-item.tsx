import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import { formatDateTime } from "@/utils/date-time";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

import Link from "next/link";

export type Hunt = {
  createdAt: string;
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationInSeconds: number;
  imageUrl: string;
  bannerImageUrl: string;
  description: string;
  maxConcurrentParticipants: number;
  maxTotalParticipants: number;
  isActive: boolean;
  rarity: {
    id: string;
    name: string;
    sortOrder: number;
  };
  rewardCollections: {
    id: string;
    name: string;
    itemCollection: {
      id: string;
      name: string;
      imageUrl: string;
      amount: number;
      item: {
        id: string;
        name: string;
        imageUrl: string;
        token: {
          id: string;
          mintAddress: string;
        };
      };
    };
  }[];
  gateCollections: {
    id: string;
    traitCollection: {
      id: string;
      value: string;
      name: string;
      trait: {
        id: string;
        name: string;
      };
    };
  }[];
  restrictionCollections: {
    id: string;
    traitCollection: {
      id: string;
      value: string;
      name: string;
      trait: {
        id: string;
        name: string;
      };
    };
  }[];
  instances: {
    vampire: {
      id: string;
      name: string;
      imageUrl: string;
      token: {
        id: string;
        mintAddress: string;
      };
    };
    id: string;
  };
};

export const HuntsListItem = ({ hunt }: { hunt: Hunt }) => {
  return (
    <TableRow keyId={hunt.id}>
      <ImageWithFallback
        className="rounded-2xl"
        src={hunt.imageUrl || ""}
        width={60}
        height={60}
        alt="Store image"
      />
      <div className="my-4 w-1/4 flex items-center space-x-4">
        <div>{hunt.name}</div>
      </div>
      <div className="my-4 flex items-center space-x-4">
        <CalendarIcon className="h-5 w-5 text-stone-300" />
        <div>{formatDateTime(hunt.startTime)}</div>
      </div>
      <div className="my-4 flex items-center space-x-4">
        <ClockIcon className="h-5 w-5 text-stone-300" />
        <div>{Math.floor(hunt.durationInSeconds / 60 / 60)}h </div>
      </div>
      <div className="flex flex-grow"></div>
      <Link
        className="bg-stone-800 text-stone-300 px-4 py-2 rounded-lg uppercase text-sm"
        href={`/admin/activity/${hunt.id}`}
      >
        Manage
      </Link>
    </TableRow>
  );
};
