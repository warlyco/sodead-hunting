import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_HUNTS } from "@/graphql/queries/get-hunts";
import { Hunt, HuntsListItem } from "@/features/admin/hunts/hunts-list-item";

export const HuntsList = () => {
  const { data } = useQuery(GET_HUNTS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_hunt?.map((hunt: Hunt) => {
        return <HuntsListItem key={hunt.id} hunt={hunt} />;
      })}
    </TableWrapper>
  );
};
