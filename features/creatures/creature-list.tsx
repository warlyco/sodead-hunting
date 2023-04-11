import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { CreatureListItem } from "@/features/creatures/creature-list-item";
import Spinner from "@/features/UI/spinner";
import classNames from "classnames";

export type Creature = {
  id: string;
  name: string;
  imageUrl: string;
  token: {
    id: string;
    mintAddress: string;
  };
  traitInstances: {
    id: string;
    value: string;
    trait: {
      id: string;
      name: string;
    };
  }[];
  mainCharacterActivityInstances: {
    id: string;
    startTime: string;
    endTime: string;
    isComplete: boolean;
    activity: {
      id: string;
      startTime: string;
      endTime: string;
    };
  }[];
};

export const CreatureList = ({
  creatures,
  isLoading,
  title,
  selectedCreatures,
  setSelectedCreatures,
  activity,
}: {
  creatures: Creature[] | null;
  isLoading: boolean;
  title?: string;
  selectedCreatures?: Creature[];
  setSelectedCreatures?: (creatures: Creature[]) => void;
  activity?: Hunt;
}) => {
  const selectCreature = (creature: Creature) => {
    if (!setSelectedCreatures || !selectedCreatures) return;

    // only allow if activityInstance endTime has passed
    const activityInstance = creature.mainCharacterActivityInstances.find(
      ({ activity: instance, isComplete }) =>
        instance.id === activity?.id && !isComplete
    );
    if (!!activityInstance && new Date(activityInstance.endTime) > new Date()) {
      return;
    }

    if (selectedCreatures.includes(creature)) {
      setSelectedCreatures(
        selectedCreatures.filter(
          (selectedCreature) => selectedCreature !== creature
        )
      );
    } else {
      setSelectedCreatures([...selectedCreatures, creature]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      {!!title?.length && (
        <div className="text-4xl font-strange-dreams text-center mb-12 tracking-wider">
          {title}
        </div>
      )}
      {!!isLoading ? (
        <div className="flex w-full justify-center mb-16">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-wrap mb-16">
          {!!creatures?.length ? (
            creatures.map((creature) => (
              <div
                onClick={() => selectCreature(creature)}
                key={creature.id}
                className="w-1/2 md:w-1/3 p-2 cursor-pointer hover:scale-[1.04] transition-all duration-300"
              >
                <CreatureListItem
                  activity={activity}
                  key={creature.id}
                  creature={creature}
                  isSelected={
                    !!selectedCreatures && selectedCreatures.includes(creature)
                  }
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
