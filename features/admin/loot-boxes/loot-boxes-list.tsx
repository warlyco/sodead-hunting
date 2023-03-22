import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_LOOT_BOXES_WITH_DETAILS } from "@/graphql/queries/get-loot-boxes-with-details";
import {
  LootBox,
  LootBoxesListItem,
} from "@/features/admin/loot-boxes/loot-box-list-item";

export const LootBoxesList = () => {
  const { data } = useQuery(GET_LOOT_BOXES_WITH_DETAILS, {
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
