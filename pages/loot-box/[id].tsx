import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { useQuery } from "@apollo/client";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

const LootBoxDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [lootBox, setLootBox] = useState<LootBox | null>(null);

  const { loading, error, data } = useQuery(GET_LOOT_BOX_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({ sodead_lootBoxes_by_pk }) => {
      setLootBox(sodead_lootBoxes_by_pk);
    },
  });

  return (
    <ContentWrapper className="flex flex-col items-center">
      <ImageWithFallback
        className="rounded-2xl mb-4"
        src={lootBox?.imageUrl || ""}
        width={350}
        height={350}
        alt="Lootbox image"
      />
      <h1 className="text-3xl mb-6">{lootBox?.name}</h1>
      <div className="italic text-lg">{lootBox?.description}</div>
    </ContentWrapper>
  );
};

export default LootBoxDetailPage;
