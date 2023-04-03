import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { Card } from "@/features/UI/card";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { GET_ENABLED_LOOT_BOXES_WITH_DETAILS } from "@/graphql/queries/get-enabled-loot-boxes-with-details";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";

export const ActiveLootBoxes = () => {
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
      <h1 className="text-5xl mb-12 text-center font-strange-dreams tracking-wider">
        Active Loot Boxes
      </h1>
      <div className="flex w-full max-w-6xl just m-auto flex-wrap">
        {!!lootBoxes &&
          lootBoxes?.map((lootBox) => (
            <Link
              href={`/loot-box/${lootBox.id}`}
              key={lootBox.id}
              className="w-full md:w-1/3 p-4 flex justify-center"
            >
              <Card imageUrl={lootBox.imageUrl}>
                <div className="text-3xl font-strange-dreams tracking-widest">
                  {lootBox.name}
                </div>
              </Card>
            </Link>
          ))}
      </div>
    </>
  );
};
