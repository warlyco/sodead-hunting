import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_VAMPIRES } from "@/graphql/queries/get-vampires";
import {
  Vampire,
  VampiresListItem,
} from "@/features/admin/vampires/vampires-list-item";

export const VampiresList = () => {
  const { data } = useQuery(GET_VAMPIRES, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_creatures?.map((vampire: Vampire) => {
        return <VampiresListItem key={vampire.id} vampire={vampire} />;
      })}
    </TableWrapper>
  );
};
