import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Panel } from "@/features/UI/panel";
import SharedHead from "@/features/UI/head";
import { TokensList } from "@/features/admin/tokens/tokens-list";
import { ItemsList } from "@/features/admin/items/items-list";
import { TraitsList } from "@/features/admin/traits/traits-list";

const tabs: ITab[] = [
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
    name: "Communities & NFTs",
    value: "communities",
  },
];

const creaturesTabs: ITab[] = [
  {
    name: "Vampires",
    value: "vampires",
  },
  {
    name: "Mounts",
    value: "mounts",
  },
  {
    name: "Pets",
    value: "pets",
  },
];

const itemsTabs: ITab[] = [
  {
    name: "Tokens",
    value: "tokens",
  },
  {
    name: "Items",
    value: "items",
  },
  {
    name: "Traits",
    value: "traits",
  },
];

const huntTabs: ITab[] = [
  {
    name: "Hunts",
    value: "hunts",
  },
  {
    name: "Rewards",
    value: "rewards",
  },
  {
    name: "Reward Collections",
    value: "reward-collections",
  },
  {
    name: "Loot Boxes",
    value: "loot-boxes",
  },
  {
    name: "Keys",
    value: "keys",
  },
];

const communityTabs: ITab[] = [
  {
    name: "Communities",
    value: "communities",
  },
  {
    name: "NFTs",
    value: "nfts",
  },
];

const Admin: NextPage = () => {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeSubTab, setActiveSubTab] = useState<ITab>(huntTabs[0]);

  const updateUrl = useCallback(
    (tab: ITab) => {
      if (tab.value === activeSubTab.value) return;
      router.push({
        pathname: "/admin",
        query: { tab: tab.value },
      });
    },
    [activeSubTab, router]
  );

  const handleSetPrimaryTab = (tab: ITab) => {
    setActiveTab(tab);
    switch (tab.value) {
      case "hunting":
        setActiveSubTab(huntTabs[0]);
        updateUrl(huntTabs[0]);
        break;
      case "creatures":
        setActiveSubTab(creaturesTabs[0]);
        updateUrl(creaturesTabs[0]);
        break;
      case "items":
        setActiveSubTab(itemsTabs[0]);
        updateUrl(itemsTabs[0]);
        break;
      case "communities":
      default:
        setActiveSubTab(communityTabs[0]);
        updateUrl(communityTabs[0]);
        break;
    }
  };

  const handleSetSubTab = (tab: ITab) => {
    setActiveSubTab(tab);
    updateUrl(tab);
  };

  useEffect(() => {
    if (!router?.query?.tab) {
      router.push({
        pathname: "/admin",
        query: { tab: huntTabs[0].value },
      });
    }
  }, [router]);

  if (!isAdmin) {
    return (
      <ContentWrapper>
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
          tabs={tabs}
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
        {activeTab.value === "communities" && (
          <Tabs
            tabs={communityTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
      </div>

      {/* Hunting */}
      {activeSubTab.value === "hunts" && <div>Hunts</div>}
      {activeSubTab.value === "rewards" && <div>Rewards</div>}
      {activeSubTab.value === "reward-collections" && (
        <div>Reward Collections</div>
      )}
      {activeSubTab.value === "loot-boxes" && <div>Loot Boxes</div>}
      {activeSubTab.value === "keys" && <div>Keys</div>}

      {/* Creatures */}
      {activeSubTab.value === "vampires" && <div>Vampires</div>}
      {activeSubTab.value === "mounts" && <div>Mounts</div>}
      {activeSubTab.value === "pets" && <div>Pets</div>}

      {/* Items */}
      {activeSubTab.value === "tokens" && <TokensList />}
      {activeSubTab.value === "items" && <ItemsList />}
      {activeSubTab.value === "traits" && <TraitsList />}

      {/* Communities */}
      {activeSubTab.value === "communities" && <div>Communities</div>}
      {activeSubTab.value === "nfts" && <div>NFTs</div>}
    </ContentWrapper>
  );
};

export default Admin;
