import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

const tabs: ITab[] = [
  {
    name: "Hunting",
    value: "hunting",
  },
  {
    name: "Communities & NFTs",
    value: "communities",
  },
];

const huntTabs: ITab[] = [
  {
    name: "Hunts",
    value: "hunts",
  },
  {
    name: "Rewrads",
    value: "rewards",
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
        <div>Not Admin</div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <div className="text-3xl mb-4">Admin</div>
      <div className="px-2 lg:px-0 pb-4">
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
        {activeTab.value === "communities" && (
          <Tabs
            tabs={communityTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
      </div>
    </ContentWrapper>
  );
};

export default Admin;
