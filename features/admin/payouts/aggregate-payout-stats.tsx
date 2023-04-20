import { Payout } from "@/pages/profile/[id]";
import { useEffect, useState } from "react";

export const AggregatePayoutStats = ({ payouts }: { payouts: Payout[] }) => {
  const [rewardsWithCounts, setRewardsWithCounts] = useState<any[]>([]);

  useEffect(() => {
    const uniqueRewardItems = payouts
      .map((payout) => payout.item)
      .filter(
        (item, index, self) => self.findIndex((t) => t.id === item.id) === index
      );

    // sort by count
    const uniqueRewardItemsWithCount = uniqueRewardItems
      .map((item) => {
        const count = payouts.filter(
          (payout) => payout.item.id === item.id
        ).length;
        return { ...item, count };
      })
      .sort((a, b) => b.count - a.count);
    setRewardsWithCounts(uniqueRewardItemsWithCount);
    console.log({ payouts, uniqueRewardItems, uniqueRewardItemsWithCount });
  }, [payouts]);

  return (
    <div className="">
      <div className="flex flex-col items-center space-x-4">
        <div className="flex space-x-4 mb-2 text-lg">
          <div>Total Payouts:</div>
          <div>{payouts.length}</div>
        </div>
        <div className="flex flex-wrap max-w-xl mx-auto">
          {rewardsWithCounts.map((reward) => (
            <div className="flex items-center space-x-4 w-1/2" key={reward.id}>
              <div>{reward.name}:</div>
              <div>{reward.count}</div>
              <div>
                {Number((reward.count / payouts.length) * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
