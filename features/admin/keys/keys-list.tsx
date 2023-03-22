import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_KEYS } from "@/graphql/queries/get-keys";
import { Key, KeysListItem } from "@/features/admin/keys/keys-list-item";

export const KeysList = () => {
  const { data } = useQuery(GET_KEYS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_items?.map((key: Key) => {
        return <KeysListItem key={key.id} keyItem={key} />;
      })}
    </TableWrapper>
  );
};
