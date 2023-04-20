import { ContentWrapper } from "@/features/UI/content-wrapper";
import { PayoutList } from "@/features/admin/payouts/payout-list";
import { GET_LOOT_BOX_PAYOUTS_BY_LOOT_BOX_ID } from "@/graphql/queries/get-loot-box-payouts-by-loot-box-id";
import { Payout } from "@/pages/profile/[id]";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";

const PayoutsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [payouts, setPayouts] = useState<Payout[] | null>(null);

  const { loading: payoutsLoading } = useQuery(
    GET_LOOT_BOX_PAYOUTS_BY_LOOT_BOX_ID,
    {
      variables: {
        id,
      },
      skip: !id,
      onCompleted: ({ sodead_payouts }) => {
        console.log({ sodead_payouts });
        setPayouts(sodead_payouts);
      },
    }
  );
  return (
    <ContentWrapper className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Payouts</h1>
      {payoutsLoading && <p>Loading payouts...</p>}
      {payouts && <PayoutList payouts={payouts} />}
    </ContentWrapper>
  );
};

export default PayoutsPage;
