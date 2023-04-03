import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { HuntDetails } from "@/features/hunts/hunt-details";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
import { useUser } from "@/hooks/user";
import { useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";

const HuntDetailPage: NextPage = () => {
  const { user, loadingUser } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [hunt, setHunt] = useState<Hunt | null>(null);

  const { data: hunts, loading: loadingHunts } = useQuery(GET_HUNT_BY_ID, {
    variables: {
      id: id,
    },
    onCompleted: ({ sodead_activities_by_pk }) => {
      if (!sodead_activities_by_pk) return;
      setHunt(sodead_activities_by_pk);
    },
  });

  if (loadingUser || loadingHunts)
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );

  if (!user?.accounts?.length)
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <UserWithoutAccountBlocker />
        </div>
      </ContentWrapper>
    );

  if (!hunt)
    return (
      <ContentWrapper>
        <h1>
          Hunt with id {id} not found.{" "}
          <span
            className="text-stone-300 cursor-pointer text-3xl"
            onClick={() => router.push("/")}
          >
            💀
          </span>
        </h1>
      </ContentWrapper>
    );

  return (
    <>
      <div className="w-full relative h-[400px] lg:h-[450px] xl:h-[550px] mx-auto max-w-[5120px] transition-all duration-300 pointer-events-none">
        <div
          className={classNames(
            "w-full h-full absolute top-16",
            "bg-left md:bg-top"
          )}
          style={{
            backgroundImage: `url(${hunt.imageUrl})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute w-full h-full bg-gradient-to-t from-black to-transparent via-transparent top-16" />
        <div className="absolute w-full h-full top-16 flex">
          <div className="w-1/2"></div>
          <div className="w-1/2">
            <div className="flex-col items-center justify-center pt-0 hidden xl:flex h-full">
              <HuntDetails hunt={hunt} />
            </div>
          </div>
        </div>
      </div>
      <ContentWrapper className="flex flex-col items-center pt-20 xl:pt-28">
        <div className="xl:hidden mx-auto mb-8 w-full flex flex-col items-center space-y-8">
          <HuntDetails hunt={hunt} />
        </div>
      </ContentWrapper>
    </>
  );
};

export default HuntDetailPage;
