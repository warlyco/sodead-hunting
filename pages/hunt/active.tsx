import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { ActiveHuntsList } from "@/features/hunts/active-hunts-list";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { useUser } from "@/hooks/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next";
import { useEffect, useState } from "react";

const ActiveHuntsPage: NextPage = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    }
  });

  return (
    <ContentWrapper>
      {isLoaded ? (
        <>
          {publicKey && user?.accounts?.length ? (
            <ActiveHuntsList />
          ) : (
            <UserWithoutAccountBlocker />
          )}
        </>
      ) : (
        <ContentWrapperYAxisCenteredContent>
          <Spinner />
        </ContentWrapperYAxisCenteredContent>
      )}
    </ContentWrapper>
  );
};

export default ActiveHuntsPage;
