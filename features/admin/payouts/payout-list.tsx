import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_LOOT_BOX_PAYOUTS_BY_LOOT_BOX_ID } from "@/graphql/queries/get-loot-box-payouts-by-loot-box-id";
import { Payout } from "@/pages/profile/[id]";
import { PayoutListItem } from "@/features/admin/payouts/payout-list-item";

export const PayoutList = ({ payouts }: { payouts: Payout[] }) => {
  return (
    <TableWrapper>
      {payouts?.map((payout: Payout) => {
        return <PayoutListItem key={payout.id} payout={payout} />;
      })}
    </TableWrapper>
  );
};
