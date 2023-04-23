import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";

import { Panel } from "@/features/UI/panel";
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { RarityBadge } from "@/features/UI/badges/rarity-badge";
import { LootBoxRewards } from "@/features/loot-boxes/loot-box-rewards-list";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { BASE_URL } from "@/constants/constants";
import axios from "axios";
import showToast from "@/features/toasts/show-toast";

const LootBoxDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [lootBox, setLootBox] = useState<LootBox | null>(null);
  const { isAdmin } = useAdmin();
  const [rewardCollections, setRewardCollections] = useState<
    LootBox["rewardCollections"]
  >([]);

  const { loading, error, refetch } = useQuery(GET_LOOT_BOX_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({
      sodead_lootBoxes_by_pk,
    }: {
      sodead_lootBoxes_by_pk: LootBox;
    }) => {
      setLootBox(sodead_lootBoxes_by_pk);
      const rewardCollections = [
        ...(sodead_lootBoxes_by_pk?.rewardCollections || []),
      ];

      setRewardCollections(rewardCollections);
      setHasBeenFetched(true);
    },
  });

  const toggleIsEnabled = async () => {
    if (!lootBox) return;
    await axios.post(`${BASE_URL}/api/enable-disable-loot-box`, {
      id: lootBox.id,
      enable: !lootBox.isEnabled,
    });
    await refetch();
    showToast({
      primaryMessage: `Lootbox ${lootBox.isEnabled ? "disabled" : "enabled"}`,
    });
  };

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
                <div className="flex w-48 justify-between mb-4">
                  <div>Status:</div>
                  <div>{lootBox.isEnabled ? "Enabled" : "Disabled"}</div>
                </div>
                <SecondaryButton onClick={toggleIsEnabled} className="mb-8">
                  {lootBox.isEnabled ? "Disable" : "Enable"}
                </SecondaryButton>
                <a
                  className="uppercase mb-8 underline"
                  href={`/admin/loot-box/${id}/payouts`}
                >
                  View Payouts
                </a>
                {!!lootBox.rarity && (
                  <div className="mb-8">
                    <RarityBadge rarity={lootBox.rarity} />
                  </div>
                )}
                <div className="text-center uppercase text-lg">Rewards</div>
                <LootBoxRewards lootBox={lootBox} />
                <div className="mb-4 w-full">
                  <div className="text-center uppercase text-lg">Costs</div>
                  {!!lootBox?.costCollections &&
                    lootBox.costCollections.map(
                      ({ itemCollection, hashListCollection }) => (
                        <Fragment key={itemCollection?.id}>
                          {!!itemCollection?.name && (
                            <div className="flex justify-between items-center border border-stone-800 rounded-lg p-2 my-2">
                              {/* Top level name */}
                              <div>{itemCollection?.name}</div>
                            </div>
                          )}
                          {!!hashListCollection?.name && (
                            <div className="flex justify-between items-center border border-stone-800 rounded-lg p-2 my-2">
                              {/* Top level name */}
                              <div>{hashListCollection?.name}</div>
                            </div>
                          )}
                        </Fragment>
                      )
                    )}
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
