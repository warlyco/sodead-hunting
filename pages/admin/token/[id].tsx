import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { GET_TOKEN_BY_ID } from "@/graphql/queries/get-token-by-id";
import { useAdmin } from "@/hooks/admin";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { getAbbreviatedAddress } from "@/utils/formatting";

export interface TokenClaimToken {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  mintAddress: string;
  createdAt: string;
  updatedAt: string;
}

const TokenDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [token, setToken] = useState<TokenClaimToken | null>(null);
  const { isAdmin } = useAdmin();

  const { data, loading, error } = useQuery(GET_TOKEN_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      console.log("data", data);
      const { sodead_tokens_by_pk } = data;
      setToken(sodead_tokens_by_pk);
      setHasBeenFetched(true);
    },
  });

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!token && hasBeenFetched && <div>Item not found</div>}
      {!!token && (
        <>
          <ContentWrapper>
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full flex flex-col items-center">
              <ImageWithFallback
                className="rounded-2xl shadow-xl border border-stone-800 w-12 h-12 object-contain object-center mb-4"
                src={token.imageUrl || ""}
                width={30}
                height={30}
                alt="Token image"
              />
              <h1 className="text-3xl mb-2">{token.name}</h1>
              <div className="text-xl mb-4">${token.symbol}</div>
              <a
                className="text-xl underline"
                href={`https://explorer.solana.com/address/${token.mintAddress}`}
                target="_blank"
                rel="noreferrer"
              >
                {getAbbreviatedAddress(token.mintAddress)}
              </a>
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
};

export default TokenDetailPage;
