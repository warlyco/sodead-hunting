import { BASE_URL, REWARD_WALLET_ADDRESS } from "@/constants/constants";
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { TokenBalance } from "@/pages/api/get-token-balances-from-helius";
import axios from "axios";
import { Fragment, useCallback, useEffect, useState } from "react";

export const LootBoxRewards = ({ lootBox }: { lootBox: LootBox }) => {
  const [rewardCollections, setRewardCollections] = useState<
    LootBox["rewardCollections"]
  >([]);
  const [isFetchingTokenBalances, setIsFetchingTokenBalances] =
    useState<boolean>(false);
  const [lootBoxTokenBalances, setLootBoxTokenBalances] = useState<
    TokenBalance[]
  >([]);

  const getLootBoxTokenBalances = useCallback(async () => {
    setIsFetchingTokenBalances(true);
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: REWARD_WALLET_ADDRESS,
      }
    );
    setLootBoxTokenBalances(data);
    setIsFetchingTokenBalances(false);
  }, [setIsFetchingTokenBalances, setLootBoxTokenBalances]);

  const getItemBalance = (mintAddress: string) => {
    if (!lootBoxTokenBalances?.length) return;
    return lootBoxTokenBalances.find(({ mint }) => mint === mintAddress)
      ?.amount;
  };

  useEffect(() => {
    const { rewardCollections } = lootBox;
    if (!rewardCollections) return;
    if (!lootBoxTokenBalances?.length) getLootBoxTokenBalances();
    const sortedRewards = [...rewardCollections].sort((a, b) => {
      if (!a.payoutChance) return 1;
      if (!b.payoutChance) return -1;
      return b.payoutChance - a.payoutChance;
    });
    setRewardCollections(sortedRewards);
  }, [getLootBoxTokenBalances, lootBox, lootBoxTokenBalances?.length]);

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
              <div className="flex flex-wrap w-full flex-1 justify-between rounded-lg p-2">
                {/* Top level name */}
                {!!itemCollection?.name && (
                  <>
                    <div className="font-bold">{itemCollection?.name}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                  </>
                )}
                {!!hashListCollection?.id && (
                  <>
                    <div>{hashListCollection?.name}</div>
                    <div>{!!payoutChance && payoutChance * 100}%</div>
                  </>
                )}
                {!!parentName && !itemCollection?.name && (
                  <>
                    <div className="w-full flex justify-between lg:w-2/5 font-bold mb-2">
                      <div>{parentName}</div>
                      <div className="lg:hidden">
                        {!!payoutChance && payoutChance * 100}%
                      </div>
                    </div>
                    <div className="flex flex-col justify-end w-full lg:w-2/5 flex-wrap">
                      {!!childRewardCollections &&
                        childRewardCollections.map(
                          ({ itemCollection, hashListCollection }) => (
                            <>
                              {!!itemCollection?.id && (
                                <div
                                  key={itemCollection?.id}
                                  className="mb-2 rounded-lg lg:text-right"
                                >
                                  {!!getItemBalance(
                                    itemCollection.item.token.mintAddress
                                  ) && (
                                    <div>
                                      {itemCollection?.name.replace("1", "")}
                                      <div className="text-red-500">
                                        {getItemBalance(
                                          itemCollection.item.token.mintAddress
                                        )}
                                        x Remaining
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
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
                    <div className="w-full hidden lg:w-1/5 lg:flex justify-end order-1">
                      {!!payoutChance && payoutChance * 100}%
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
