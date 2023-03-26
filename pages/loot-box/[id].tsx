import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { NftCollectionsListItem } from "@/features/admin/nft-collections/nfts-collection-list-item";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { Card } from "@/features/UI/card";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { GET_HASH_LIST_BY_ID } from "@/graphql/queries/get-hash-list-by-id";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { useUser } from "@/hooks/user";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { useQuery } from "@apollo/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const LootBoxDetailPage: NextPage = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { user, loadingUser } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [lootBox, setLootBox] = useState<LootBox | null>(null);
  const [rewardHashList, setRewardHashList] = useState<string[]>([]);
  const [costHashList, setCostHashList] = useState<string[]>([]);
  const [hashListRewardCollectionId, setHashListRewardCollectionId] = useState<
    string | null
  >(null);
  const [hashListCostCollectionId, setHashListCostCollectionId] = useState<
    string | null
  >(null);
  const [costTokenImageUrl, setCostTokenImageUrl] = useState<string | null>(
    null
  );
  const [userHeldCostTokens, setUserHeldCostTokens] = useState<string[]>([]);
  const [hasFetchUserHeldCostTokens, setHasFetchUserHeldCostTokens] =
    useState<boolean>(false);
  const [isEnabledClaimButton, setIsEnabledClaimButton] =
    useState<boolean>(false);
  const [costAmount, setCostAmount] = useState<number>(0);

  const { loading: loadingRewardHashList } = useQuery(GET_HASH_LIST_BY_ID, {
    variables: {
      id: hashListRewardCollectionId,
    },
    skip: !hashListRewardCollectionId,
    onCompleted: ({ sodead_hashLists }) => {
      const { rawHashList } = sodead_hashLists?.[0];
      setRewardHashList(rawHashList);
    },
  });

  const { loading: loadingCostHashList } = useQuery(GET_HASH_LIST_BY_ID, {
    variables: {
      id: hashListCostCollectionId,
    },
    skip: !hashListCostCollectionId,
    onCompleted: ({ sodead_hashLists }) => {
      const { rawHashList } = sodead_hashLists?.[0];
      setCostHashList(rawHashList);
    },
  });

  const { loading: loadingLootBox } = useQuery(GET_LOOT_BOX_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({ sodead_lootBoxes_by_pk }) => {
      setLootBox(sodead_lootBoxes_by_pk);
      const hashListRewardCollectionId =
        sodead_lootBoxes_by_pk?.rewardCollections?.[0]?.hashListCollection
          ?.hashList?.id;
      const hashListCostCollectionId =
        sodead_lootBoxes_by_pk?.costCollections?.[0]?.hashListCollection
          ?.hashList?.id;
      setHashListRewardCollectionId(hashListRewardCollectionId);
      setHashListCostCollectionId(hashListCostCollectionId);
      setCostAmount(
        sodead_lootBoxes_by_pk?.costCollections?.[0]?.hashListCollection.amount
      );
      setCostTokenImageUrl(
        sodead_lootBoxes_by_pk?.costCollections?.[0]?.hashListCollection
          ?.imageUrl
      );
    },
  });

  const fetchUserHeldCostTokens = useCallback(async () => {
    if (!publicKey || !user || !connection || !costHashList.length) return;
    const costTokens = await fetchNftsByHashList({
      hashList: costHashList,
      publicKey,
      connection,
    });
    setUserHeldCostTokens(costTokens);
    setHasFetchUserHeldCostTokens(true);
  }, [publicKey, user, connection, costHashList]);

  useEffect(() => {
    console.log({
      userHeldCostTokens: userHeldCostTokens.length,
      costAmount,
    });
    if (
      !publicKey ||
      !user ||
      !connection ||
      !hashListCostCollectionId ||
      !hashListRewardCollectionId ||
      !costHashList.length
    )
      return;

    fetchUserHeldCostTokens();
  }, [
    rewardHashList,
    costHashList,
    publicKey,
    user,
    connection,
    fetchUserHeldCostTokens,
    hashListCostCollectionId,
    hashListRewardCollectionId,
    userHeldCostTokens.length,
    costAmount,
  ]);

  if (
    loadingUser ||
    loadingLootBox ||
    loadingRewardHashList ||
    loadingCostHashList
  ) {
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <Spinner />
        </div>
      </ContentWrapper>
    );
  }

  if (!user?.accounts?.length)
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <UserWithoutAccountBlocker />
        </div>
      </ContentWrapper>
    );

  return (
    <ContentWrapper>
      <div className="flex items-center flex-wrap">
        <div className="flex-col flex w-full justify-center md:w-1/2 items-center mb-16 md:mb-0">
          <ImageWithFallback
            className="rounded-2xl mb-12 border-2 border-purple-500 "
            src={lootBox?.imageUrl || ""}
            width={350}
            height={350}
            alt="Lootbox image"
          />
          <h1 className="text-3xl mb-8">{lootBox?.name}</h1>
          <div className="italic text-2xl max-w-sm text-center">
            {lootBox?.description}
          </div>
        </div>
        <div className="flex-col md:flex-row flex w-full justify-center md:w-1/2 items-center">
          <div className="flex items-center mb-8 text-3xl space-y-6 flex-col">
            <ImageWithFallback
              src={costTokenImageUrl || ""}
              width={200}
              height={200}
              alt="Cost token image"
              className="border-2 border-purple-500 rounded-2xl h-48 w-48 mb-6"
            />
            <div className="flex">
              <div className="uppercase">Cost:</div>
              <div>{costAmount}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="uppercase">You have:</div>
              {hasFetchUserHeldCostTokens ? (
                <div>{userHeldCostTokens.length}</div>
              ) : (
                <Spinner />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="py-8 w-full justify-center flex">
        <SubmitButton
          className="text-2xl"
          isSubmitting={false}
          onClick={() => {}}
          disabled={!(userHeldCostTokens.length >= costAmount)}
        >
          Claim
        </SubmitButton>
      </div>
    </ContentWrapper>
  );
};

export default LootBoxDetailPage;
