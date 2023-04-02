import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { Fragment, useEffect, useState } from "react";

export const LootBoxRewards = ({ lootBox }: { lootBox: LootBox }) => {
  const [rewardCollections, setRewardCollections] = useState<
    LootBox["rewardCollections"]
  >([]);
  useEffect(() => {
    const { rewardCollections } = lootBox;
    if (!rewardCollections) return;
    const sortedRewards = [...rewardCollections].sort((a, b) => {
      if (!a.payoutChance) return 1;
      if (!b.payoutChance) return -1;
      return b.payoutChance - a.payoutChance;
    });
    setRewardCollections(sortedRewards);
  }, [lootBox]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-1 justify-between rounded-lg p-2 my-2 text-lg uppercase">
        <div>Reward</div>
        <div>Chance</div>
      </div>
      {!!rewardCollections &&
        rewardCollections.map(
          (
            {
              itemCollection,
              hashListCollection,
              childRewardCollections,
              payoutChance,
              name: parentName,
            },
            i
          ) => (
            <Fragment key={itemCollection?.id}>
              <div className="flex w-full flex-1 justify-between rounded-lg p-2">
                {/* Top level name */}
                {!!itemCollection?.name && (
                  <>
                    <div>{itemCollection?.name}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                  </>
                )}
                {!!hashListCollection?.id && (
                  <>
                    <div>{hashListCollection?.name}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                  </>
                )}
                {/* Parent name */}
                {!!parentName && !itemCollection?.name && (
                  <>
                    <div>{parentName}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                    {/* <div>
                      {!!childRewardCollections &&
                        childRewardCollections.map(
                          ({ itemCollection, hashListCollection }) => (
                            <>
                              {!!itemCollection?.id && (
                                <div
                                  key={itemCollection?.id}
                                  className="p-2 rounded-lg"
                                >
                                  <div>{itemCollection?.name}</div>
                                </div>
                              )}
                              {JSON.stringify(hashListCollection)}
                              {!!hashListCollection?.id && (
                                <div
                                  key={hashListCollection?.id}
                                  className="p-2 rounded-lg"
                                >
                                  <div>{hashListCollection?.name}</div>
                                </div>
                              )}
                            </>
                          )
                        )}
                    </div> */}
                  </>
                )}
              </div>
            </Fragment>
          )
        )}
    </div>
  );
};
