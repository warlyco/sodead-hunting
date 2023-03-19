import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_REWARDS } from "@/graphql/queries/get-rewards";
import {
  Reward,
  RewardsListItem,
} from "@/features/admin/rewards/rewards-list-item";
import { GET_LOOT_BOXES_WITH_REWARDS } from "@/graphql/queries/get-loot-boxes-with-rewards";
import {
  LootBox,
  LootBoxesListItem,
} from "@/features/admin/loot-boxes/loot-box-list-item";

export const LootBoxesList = () => {
  const { data } = useQuery(GET_LOOT_BOXES_WITH_REWARDS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_lootBoxes?.map((lootBox: LootBox) => {
        return <LootBoxesListItem key={lootBox.id} lootBox={lootBox} />;
      })}
    </TableWrapper>
  );
};
