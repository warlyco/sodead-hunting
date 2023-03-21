import { useQuery } from "@apollo/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { GET_ITEM_BY_ID } from "@/graphql/queries/get-item-by-id";
import { useAdmin } from "@/hooks/admin";
import { Item } from "@/pages/api/add-item";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";

const ItemDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const { isAdmin } = useAdmin();

  const { data, loading, error } = useQuery(GET_ITEM_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      console.log("data", data);
      const { sodead_items_by_pk } = data;
      setItem(sodead_items_by_pk);
      setHasBeenFetched(true);
    },
  });

  if (!isAdmin)
    return (
      <div className="w-full min-h-screen text-stone-300">
        <div className="pt-72 text-center text-3xl">
          You must be an admin to view this page
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!item && hasBeenFetched && <div>Item not found</div>}
      {!!item && (
        <>
          <ContentWrapper>
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="py-16">
                <ImageWithFallback
                  src={item.imageUrl}
                  height={60}
                  width={60}
                  className="w-12"
                  alt={item.name}
                />
              </div>
              <h1 className="text-3xl mb-2">{item.name}</h1>
              {!!item.tokens?.[0] && (
                <div className="text-xl mb-4">
                  Bound to token:{" "}
                  <a
                    className="text-xl underline"
                    href={`https://explorer.solana.com/address/${item.tokens?.[0].mintAddress}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {getAbbreviatedAddress(item.tokens?.[0].mintAddress)}
                  </a>
                </div>
              )}
              {!!item.tokens?.[0] && (
                <div className="text-xl mb-4">
                  Bound to NFT:{" "}
                  <a
                    className="text-xl underline"
                    href={`https://explorer.solana.com/address/${item.nfts?.[0].mintAddress}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {getAbbreviatedAddress(item.nfts?.[0].mintAddress)}
                  </a>
                </div>
              )}
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
};

export default ItemDetailPage;
