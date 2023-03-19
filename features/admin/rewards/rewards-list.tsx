import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_REWARDS } from "@/graphql/queries/get-rewards";
import {
  Reward,
  RewardsListItem,
} from "@/features/admin/rewards/rewards-list-item";

export const RewardsList = () => {
  const { data } = useQuery(GET_REWARDS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_rewards?.map((reward: Reward) => {
        return <RewardsListItem key={reward.id} reward={reward} />;
      })}
    </TableWrapper>
  );
};
