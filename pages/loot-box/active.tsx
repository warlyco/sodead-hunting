import { ActiveLootBoxes } from "@/features/loot-boxes/active-loot-boxes";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { useUser } from "@/hooks/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next";

const ActiveLootBoxesPage: NextPage = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();

  return (
    <ContentWrapper>
      {publicKey && user?.accounts?.length ? (
        <ActiveLootBoxes />
      ) : (
        <UserWithoutAccountBlocker />
      )}
    </ContentWrapper>
  );
};

export default ActiveLootBoxesPage;
