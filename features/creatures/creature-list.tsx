import { CreatureListItem } from "@/features/creatures/creature-list-item";
import Spinner from "@/features/UI/spinner";
import classNames from "classnames";
import { useState } from "react";

export type Creature = {
  id: string;
  name: string;
  imageUrl: string;
  traitInstances: {
    id: string;
    value: string;
    trait: {
      id: string;
      name: string;
    };
  }[];
};

export const CreatureList = ({
  creatures,
  isLoading,
  title,
}: {
  creatures: Creature[] | null;
  isLoading: boolean;
  title: string;
}) => {
  const [selectedCreatures, setSelectedCreatures] = useState<Creature[]>([]);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="text-4xl font-strange-dreams text-center mb-12 tracking-wider">
        {title}
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
                onClick={() => {
                  if (selectedCreatures.includes(creature)) {
                    setSelectedCreatures(
                      selectedCreatures.filter(
                        (selectedCreature) => selectedCreature !== creature
                      )
                    );
                  } else {
                    setSelectedCreatures([...selectedCreatures, creature]);
                  }
                }}
                key={creature.id}
                className={classNames([
                  "w-1/2 md:w-1/3 p-2 cursor-pointer hover:scale-[1.04] transition-all duration-300",
                ])}
              >
                <CreatureListItem
                  key={creature.id}
                  creature={creature}
                  isSelected={selectedCreatures.includes(creature)}
                />
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
