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
                    <div className="font-bold">{itemCollection?.name}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                  </>
                )}
                {!!hashListCollection?.id && (
                  <>
                    <div className="font-bold">{hashListCollection?.name}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                  </>
                )}
                {!!parentName && !itemCollection?.name && (
                  <>
                    <div className="w-full lg:w-2/5 font-bold">
                      {parentName}
                    </div>
                    <div className="flex w-full lg:w-3/5 flex-wrap">
                      <div className="flex justify-end w-full lg:w-2/5 flex-wrap order-2 lg:order-1">
                        {!!childRewardCollections &&
                          childRewardCollections.map(
                            ({ itemCollection, hashListCollection }) => (
                              <>
                                {!!itemCollection?.id && (
                                  <div
                                    key={itemCollection?.id}
                                    className="mb-2 rounded-lg text-right"
                                  >
                                    <div>
                                      {itemCollection?.name.replace("1", "")}
                                    </div>
                                  </div>
                                )}
                                {JSON.stringify(hashListCollection)}
                                {!!hashListCollection?.id && (
                                  <div
                                    key={hashListCollection?.id}
                                    className="mb-2 rounded-lg"
                                  >
                                    <div>{hashListCollection?.name}</div>
                                  </div>
                                )}
                              </>
                            )
                          )}
                      </div>
                      <div className="flex justify-end w-full lg:w-1/5 mb-2">
                        {!!payoutChance && payoutChance * 100}%
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Fragment>
          )
        )}
    </div>
  );
};
