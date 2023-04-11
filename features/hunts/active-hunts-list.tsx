import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { HuntDetailsInfoBox } from "@/features/hunts/hunt-details-info-box";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Spinner from "@/features/UI/spinner";
import { GET_ACTIVE_HUNTS } from "@/graphql/queries/get-active-hunts";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";

export const ActiveHuntsList = () => {
  const [hunts, setHunts] = useState<Hunt[] | null>(null);

  const { loading } = useQuery(GET_ACTIVE_HUNTS, {
    onCompleted: ({ sodead_activities }) => {
      setHunts(sodead_activities);
    },
  });

  return (
    <>
      <h1 className="text-5xl mb-12 text-center font-strange-dreams tracking-wider">
        Active Hunts
      </h1>
      <div className="flex w-full max-w-6xl just m-auto flex-wrap space-y-10 pb-16 px-6 5xl:px-0">
        {loading && (
          <div className="w-full flex justify-center">
            <Spinner />
          </div>
        )}
        {!!hunts &&
          hunts?.map((hunt) => (
            <Link
              href={`/hunt/${hunt.id}`}
              key={hunt.id}
              className="w-full flex flex-col justify-center bg-black rounded-2xl hover:scale-[1.01] transition-all duration-300 bg-top relative font-strange-dreams"
            >
              <div className="flex w-full">
                <div
                  className="w-full h-72 rounded-2xl mb-4"
                  style={{
                    backgroundImage: `url(${hunt.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <HuntDetailsInfoBox
                  hunt={hunt}
                  className="hidden md:flex h-full"
                >
                  <div className="flex justify-end">
                    <SecondaryButton className="text-2xl py-3 w-1/3 tracking-widest">
                      Hunt
                    </SecondaryButton>
                  </div>
                </HuntDetailsInfoBox>
              </div>
              <div className="bg-black flex flex-col justify-between bg-opacity-50 md:hidden w-full mx-auto mb-4">
                <h2 className="text-5xl tracking-widest mb-6 md:text-right">
                  {hunt.name}
                </h2>
                {!!hunt.rewardCollections?.[0] && (
                  <div className=" flex w-full md:justify-end pb-8 tracking-widest space-x-2">
                    <div>Reward:</div>
                    <div>
                      {hunt.rewardCollections?.[0]?.itemCollection?.amount}x{" "}
                      {hunt.rewardCollections?.[0]?.itemCollection?.item?.name}
                      {hunt.rewardCollections?.[0]?.itemCollection?.amount > 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <SecondaryButton className="text-2xl py-3 w-full md:w-1/3 tracking-widest">
                    Hunt
                  </SecondaryButton>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
};
