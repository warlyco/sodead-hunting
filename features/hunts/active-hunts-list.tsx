import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { Card } from "@/features/UI/card";
import { ContentWrapper } from "@/features/UI/content-wrapper";
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

  if (loading)
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );

  return (
    <>
      <h1 className="text-5xl mb-12 text-center font-strange-dreams tracking-wider">
        Active Hunts
      </h1>
      <div className="flex w-full max-w-5xl just m-auto flex-wrap space-y-10 pb-16 px-6 md:px-0">
        {/* background url */}
        {!!hunts &&
          hunts?.map((hunt) => (
            <Link
              href={`/hunt/${hunt.id}`}
              key={hunt.id}
              className="w-full flex flex-col justify-center border-2 border-red-500 rounded-2xl hover:scale-[1.01] transition-all duration-300"
            >
              <div
                className="w-full h-64 rounded-t-2xl"
                style={{
                  backgroundImage: `url(${hunt.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="text-4xl font-strange-dreams tracking-widest p-4">
                {hunt.name}
              </div>
            </Link>
          ))}
      </div>
    </>
  );
};
