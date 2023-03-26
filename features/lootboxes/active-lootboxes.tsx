import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { Card } from "@/features/UI/card";
import Spinner from "@/features/UI/spinner";
import { GET_ENABLED_LOOT_BOXES_WITH_DETAILS } from "@/graphql/queries/get-enabled-loot-boxes-with-details";
import { useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const ActiveLootboxes = () => {
  const [lootBoxes, setLootBoxes] = useState<LootBox[] | null>(null);

  const { loading } = useQuery(GET_ENABLED_LOOT_BOXES_WITH_DETAILS, {
    onCompleted: ({ sodead_lootBoxes }) => {
      setLootBoxes(sodead_lootBoxes);
    },
  });

  if (loading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <h1 className="text-4xl mb-2 text-center">Active Loot Boxes</h1>
      <div className="flex w-full max-w-5xl just m-auto flex-wrap">
        {!!lootBoxes &&
          lootBoxes?.map((lootBox) => (
            <Link
              href={`/loot-box/${lootBox.id}`}
              key={lootBox.id}
              className="w-full md:w-1/3 p-4 flex justify-center"
            >
              <Card imageUrl={lootBox.imageUrl}>
                <div className="text-2xl">{lootBox.name}</div>
              </Card>
            </Link>
          ))}
      </div>
    </>
  );
};
