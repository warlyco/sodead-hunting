import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { HuntDetailsInfoBox } from "@/features/hunts/hunt-details-info-box";
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
              className="w-full flex flex-col justify-center border-2 border-red-500 rounded-2xl hover:scale-[1.01] transition-all duration-300 bg-top relative"
            >
              <div className="flex w-full">
                <div
                  className="w-full h-72 rounded-2xl"
                  style={{
                    backgroundImage: `url(${hunt.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <HuntDetailsInfoBox
                  hunt={hunt}
                  className="hidden md:flex h-full"
                />
              </div>
              <div className="text-3xl font-strange-dreams tracking-widest p-2 mb-4 md:mb-0 px-4 md:absolute md:bottom-0 bg-black rounded-b-2xl">
                {hunt.name}
              </div>
              <HuntDetailsInfoBox
                hunt={hunt}
                className="md:hidden w-full mx-auto mb-4"
              />
            </Link>
          ))}
      </div>
    </>
  );
};
