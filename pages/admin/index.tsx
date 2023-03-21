import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import SharedHead from "@/features/UI/head";
import { TokensList } from "@/features/admin/tokens/tokens-list";
import { ItemsList } from "@/features/admin/items/items-list";
import { TraitsList } from "@/features/admin/traits/traits-list";
import { HuntsList } from "@/features/admin/hunts/hunts-list";
import { UsersList } from "@/features/admin/users/users-list";
import { RewardsList } from "@/features/admin/rewards/rewards-list";
import { LootBoxesList } from "@/features/admin/loot-boxes/loot-boxes-list";
import { KeysList } from "@/features/admin/keys/keys-list";
import { VampiresList } from "@/features/admin/vampires/vampires-list";
import { NftsList } from "@/features/admin/nfts/nfts-list";
import { CommunitiesList } from "@/features/admin/communities/communities-list";
import { NftCollectionssList } from "@/features/admin/nft-collections/nfts-collection-list";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

const primaryTabs: ITab[] = [
  {
    name: "Hunting",
    value: "hunting",
  },
  {
    name: "Items",
    value: "items",
  },
  {
    name: "Creatures",
    value: "creatures",
  },
  {
    name: "Users & NFTs",
    value: "users-nfts",
  },
];

const creaturesTabs: ITab[] = [
  {
    name: "Vampires",
    value: "vampires",
    parent: "creatures",
  },
  {
    name: "Mounts",
    value: "mounts",
    parent: "creatures",
  },
  {
    name: "Pets",
    value: "pets",
    parent: "creatures",
  },
];

const itemsTabs: ITab[] = [
  {
    name: "Tokens",
    value: "tokens",
    parent: "items",
  },
  {
    name: "Items",
    value: "items",
    parent: "items",
  },
  {
    name: "Traits",
    value: "traits",
    parent: "items",
  },
];

const huntTabs: ITab[] = [
  {
    name: "Hunts",
    value: "hunts",
    parent: "hunting",
  },
  {
    name: "Rewards",
    value: "rewards",
    parent: "hunting",
  },
  {
    name: "Loot Boxes",
    value: "loot-boxes",
    parent: "hunting",
  },
  {
    name: "Keys",
    value: "keys",
    parent: "hunting",
  },
];

const communityTabs: ITab[] = [
  {
    name: "Users",
    value: "users",
  },
  {
    name: "NFTs",
    value: "nfts",
    parent: "users-nfts",
  },
  {
    name: "Communities",
    value: "communities",
    parent: "users-nfts",
  },
  {
    name: "Nft Collections",
    value: "nft-collections",
    parent: "users-nfts",
  },
];

const subTabs = [...huntTabs, ...creaturesTabs, ...itemsTabs, ...communityTabs];

const Admin: NextPage = () => {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(primaryTabs[0]);
  const [activeSubTab, setActiveSubTab] = useState<ITab>(huntTabs[0]);

  const updateUrl = useCallback(
    (tab: ITab) => {
      router.push({
        pathname: "/admin",
        query: { tab: tab.value },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSubTab]
  );

  const handleSetSubTab = useCallback(
    (tab: ITab) => {
      setActiveSubTab(tab);

      updateUrl(tab);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setActiveSubTab]
  );

  const handleSetPrimaryTab = (tab: ITab) => {
    setActiveTab(tab);
    switch (tab.value) {
      case "hunting":
        handleSetSubTab(huntTabs[0]);
        break;
      case "creatures":
        handleSetSubTab(creaturesTabs[0]);
        break;
      case "items":
        handleSetSubTab(itemsTabs[0]);
        break;
      case "communities":
      default:
        handleSetSubTab(communityTabs[0]);
        break;
    }
  };

  const getCreateLink = () => {
    switch (activeSubTab.value) {
      case "tokens":
        return "/admin/token/create";
      case "items":
      default:
        return "/admin/item/create";
    }
  };

  useEffect(() => {
    if (router.query.tab) {
      const subTab = subTabs.find((tab) => tab.value === router.query.tab);
      const primaryTab = primaryTabs.find(
        (tab) => subTab?.parent === tab.value
      );
      if (primaryTab) setActiveTab(primaryTab);
      if (subTab) handleSetSubTab(subTab);
    }
  }, [handleSetSubTab, router.query.tab]);

  if (!isAdmin) {
    return (
      <ContentWrapper className="w-full text-center text-stone-300">
        <SharedHead />
        <div>Not Admin</div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <SharedHead title="SoDead Admin" />
      <div className="text-3xl mb-4">Admin</div>
      <div className="px-2 lg:px-0 pb-4 w-full">
        <Tabs
          tabs={primaryTabs}
          activeTab={activeTab}
          handleSetTab={(tab) => handleSetPrimaryTab(tab)}
        />
        {activeTab.value === "hunting" && (
          <Tabs
            tabs={huntTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
        {activeTab.value === "creatures" && (
          <Tabs
            tabs={creaturesTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
        {activeTab.value === "items" && (
          <Tabs
            tabs={itemsTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
        {activeTab.value === "users-nfts" && (
          <Tabs
            tabs={communityTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
      </div>

      {/* Hunting */}
      {activeSubTab.value === "hunts" && <HuntsList />}
      {activeSubTab.value === "rewards" && <RewardsList />}
      {activeSubTab.value === "loot-boxes" && <LootBoxesList />}
      {activeSubTab.value === "keys" && <KeysList />}

      {/* Creatures */}
      {activeSubTab.value === "vampires" && <VampiresList />}
      {activeSubTab.value === "mounts" && <div>Mounts</div>}
      {activeSubTab.value === "pets" && <div>Pets</div>}

      {/* Items */}
      {activeSubTab.value === "tokens" && <TokensList />}
      {activeSubTab.value === "items" && <ItemsList />}
      {activeSubTab.value === "traits" && <TraitsList />}

      {/* Users/NFTs */}
      {activeSubTab.value === "users" && <UsersList />}
      {activeSubTab.value === "nfts" && <NftsList />}
      {activeSubTab.value === "communities" && <CommunitiesList />}
      {activeSubTab.value === "nft-collections" && <NftCollectionssList />}
      <Link href={getCreateLink()}>
        <button className="bottom-4 right-4">
          <PlusCircleIcon className="w-12 h-12 absolute bottom-8 right-16 text-stone-300 hover:text-stone-900 hover:bg-stone-300 rounded-full bg-stone-900 shadow-deep hover:shadow-deep-float" />
        </button>
      </Link>
    </ContentWrapper>
  );
};

export default Admin;
