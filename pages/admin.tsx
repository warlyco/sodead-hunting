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
    name: "Communities & NFTs",
    value: "communities",
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
    name: "Reward Collections",
    value: "reward-collections",
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
    name: "Communities",
    value: "communities",
    parent: "communities",
  },
  {
    name: "NFTs",
    value: "nfts",
    parent: "communities",
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
    // if (!primaryTabs.includes(tab)) return;

    setActiveTab(tab);
    debugger;
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

  useEffect(() => {
    console.log("router.query.tab", router.query.tab);
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
        {activeTab.value === "communities" && (
          <Tabs
            tabs={communityTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
      </div>

      {/* Hunting */}
      {activeSubTab.value === "hunts" && <HuntsList />}
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
