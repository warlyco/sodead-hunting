import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { GET_ITEMS } from "@/graphql/queries/get-items";
import { Item, ItemsListItem } from "@/features/admin/items/items-list-item";

export const ItemsList = () => {
  const { data } = useQuery(GET_ITEMS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_items?.map((item: Item) => {
        return <ItemsListItem key={item.id} item={item} />;
      })}
    </TableWrapper>
  );
};
