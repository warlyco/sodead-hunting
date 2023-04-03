import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import Image from "next/image";

export type Creature = {
  id: string;
  name: string;
  imageUrl: string;
};

export const CreatureList = ({
  creatures,
  isLoading,
}: {
  creatures: Creature[] | null;
  isLoading: boolean;
}) => {
  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* <h1>{creature.creatureCategoryId}</h1> */}
      <div className="text-4xl font-strange-dreams text-center mb-12 tracking-wider">
        Your vamps
      </div>
      {!!isLoading ? (
        <div className="flex w-full justify-center mb-16">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-wrap mb-16">
          {!!creatures?.length ? (
            creatures.map((creature) => (
              <div
                key={creature.id}
                className="w-1/2 md:w-1/3 lg:w-1/4 p-2 cursor-pointer hover:scale-[1.04] transition-all duration-300"
              >
                <div className="border-4 border-rounded-2xl border-red-500 rounded-lg overflow-hidden shadow-lg border-opacity-60">
                  <Image
                    src={creature.imageUrl}
                    alt={creature.name}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center">
              <p className="text-2xl">No vampires found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
