import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_USERS } from "@/graphql/queries/get-users";
import { User, UsersListItem } from "@/features/admin/users/users-list-item";

export const UsersList = () => {
  const { data, refetch } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_users?.map((user: User) => {
        return <UsersListItem key={user.id} user={user} refetch={refetch} />;
      })}
    </TableWrapper>
  );
};
