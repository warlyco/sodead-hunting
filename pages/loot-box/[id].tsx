import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import Spinner from "@/features/UI/spinner";
import { GET_HASH_LIST_BY_ID } from "@/graphql/queries/get-hash-list-by-id";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { useUser } from "@/hooks/user";
import { useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

const LootBoxDetailPage: NextPage = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [lootBox, setLootBox] = useState<LootBox | null>(null);
  const [hashList, setHashList] = useState<string[]>([]);
  const [hashListCollectionId, setHashListCollectionId] = useState<string>("");

  const { loading: loadingHashList } = useQuery(GET_HASH_LIST_BY_ID, {
    variables: {
      id: hashListCollectionId,
    },
    skip: !hashListCollectionId,
    onCompleted: ({ sodead_hashLists }) => {
      const { rawHashList } = sodead_hashLists?.[0];
      console.log(rawHashList);
      setHashList(rawHashList);
      debugger;
      const randomIndex = Math.floor(Math.random() * hashList.length);
      const randomHash = hashList[randomIndex];
      console.log(randomHash);
    },
  });

  const { loading: loadingLootBox } = useQuery(GET_LOOT_BOX_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({ sodead_lootBoxes_by_pk }) => {
      setLootBox(sodead_lootBoxes_by_pk);
      setHashListCollectionId(
        sodead_lootBoxes_by_pk?.rewardCollections?.[0]?.hashListCollection
          ?.hashList?.id
      );
      debugger;
    },
  });

  if (!publicKey || !user) {
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <Spinner />
        </div>
      </ContentWrapper>
    );
  }

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
      {JSON.stringify(hashList)}
      <PrimaryButton>Claim</PrimaryButton>
    </ContentWrapper>
  );
};

export default LootBoxDetailPage;
