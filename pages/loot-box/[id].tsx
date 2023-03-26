import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { NftCollectionsListItem } from "@/features/admin/nft-collections/nfts-collection-list-item";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
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
    <ContentWrapper className="flex flex-col items-center">
      <ImageWithFallback
        className="rounded-2xl mb-12 border-2 border-purple-500 "
        src={lootBox?.imageUrl || ""}
        width={350}
        height={350}
        alt="Lootbox image"
      />
      <h1 className="text-3xl mb-8">{lootBox?.name}</h1>
      <div className="italic text-2xl max-w-sm text-center mb-8">
        {lootBox?.description}
      </div>
      <div className="flex items-center mb-8 text-2xl space-x-4">
        <ImageWithFallback
          src={costTokenImageUrl || ""}
          width={50}
          height={50}
          alt="Cost token image"
          className="border border-purple-500 rounded-xl p-1"
        />
        <div className="uppercase">You have:</div>
        {hasFetchUserHeldCostTokens ? (
          <div>{userHeldCostTokens.length}</div>
        ) : (
          <Spinner />
        )}
      </div>
      <div className="py-8">
        <PrimaryButton>Claim</PrimaryButton>
      </div>
    </ContentWrapper>
  );
};

export default LootBoxDetailPage;
