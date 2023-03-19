import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { Nft, NftsListItem } from "@/features/admin/nfts/nfts-list-item";
import { GET_NFTS } from "@/graphql/queries/get-nfts";

export const NftsList = () => {
  const { data } = useQuery(GET_NFTS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.sodead_nfts?.map((nft: Nft) => {
        return <NftsListItem key={nft.id} nft={nft} />;
      })}
    </TableWrapper>
  );
};
