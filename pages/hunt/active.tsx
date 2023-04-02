import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { ActiveHuntsList } from "@/features/hunts/active-hunts-list";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { useUser } from "@/hooks/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next";

const ActiveHuntsPage: NextPage = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();

  return (
    <ContentWrapper>
      {publicKey && user?.accounts?.length ? (
        <ActiveHuntsList />
      ) : (
        <UserWithoutAccountBlocker />
      )}
    </ContentWrapper>
  );
};

export default ActiveHuntsPage;
