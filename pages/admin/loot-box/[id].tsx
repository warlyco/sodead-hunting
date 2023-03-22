import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";

import { Panel } from "@/features/UI/panel";
import { formatDateTime } from "@/utils/date-time";
import { formatNumberWithCommas } from "@/utils/formatting";
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { RarityBadge } from "@/features/UI/badges/rarity-badge";

const LootBoxDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [lootBox, setLootBox] = useState<LootBox | null>(null);
  const { isAdmin } = useAdmin();

  const { loading, error } = useQuery(GET_LOOT_BOX_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({ sodead_lootBoxes_by_pk }) => {
      setLootBox(sodead_lootBoxes_by_pk);
      setHasBeenFetched(true);
    },
  });

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!lootBox && hasBeenFetched && <div>Item not found</div>}
      {!!lootBox && (
        <>
          <ContentWrapper>
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full mx-auto">
              <Panel className="flex flex-col items-center text-xl">
                <div className="mb-8">
                  <ImageWithFallback
                    className="rounded-2xl shadow-xl border border-stone-800 w-32 h-32 object-contain object-center"
                    src={lootBox.imageUrl || ""}
                    width={350}
                    height={350}
                    alt="lootBox image"
                  />
                </div>
                <h1 className="text-3xl mb-6">{lootBox.name}</h1>
                <div className="mb-8">
                  <RarityBadge rarity={lootBox.rarity} />
                </div>

                <div className="mb-4 w-full">
                  <div className="text-center uppercase text-lg">Rewards</div>
                  {!!lootBox?.itemRewardCollections &&
                    lootBox.itemRewardCollections.map(
                      ({
                        itemCollection,
                        childRewardCollections,
                        name: parentName,
                      }) => (
                        <div
                          key={itemCollection?.id}
                          className="flex justify-between items-center border border-stone-800 rounded-lg p-2 my-2"
                        >
                          {/* Top level name */}
                          {!!itemCollection?.name && (
                            <div>{itemCollection?.name}</div>
                          )}
                          {/* Parent name */}
                          <div>{parentName}</div>
                          <div>
                            {!!childRewardCollections &&
                              childRewardCollections.map(
                                ({ itemCollection, name }) => (
                                  <div
                                    key={itemCollection?.id}
                                    className="p-2 rounded-lg"
                                  >
                                    <div>{itemCollection?.name}</div>
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      )
                    )}
                </div>
                <div className="mb-4 w-full">
                  <div className="text-center uppercase text-lg">Costs</div>
                  {!!lootBox?.itemCostCollections &&
                    lootBox.itemCostCollections.map(({ itemCollection }) => (
                      <div
                        key={itemCollection?.id}
                        className="flex justify-between items-center border border-stone-800 rounded-lg p-2 my-2"
                      >
                        {/* Top level name */}
                        <div>{itemCollection?.name}</div>
                        {/* Parent name */}
                        <div className="">{}</div>
                      </div>
                    ))}
                </div>
              </Panel>
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
};

export default LootBoxDetailPage;
