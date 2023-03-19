import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import {
  CommunitiesListItem,
  Community,
} from "@/features/admin/communities/communities-list-item";
import { GET_COMMUNITIES } from "@/graphql/queries/get-communities";

export const CommunitiesList = () => {
  const { data } = useQuery(GET_COMMUNITIES, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_communities?.map((community: Community) => {
        return <CommunitiesListItem key={community.id} community={community} />;
      })}
    </TableWrapper>
  );
};
