import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { Creature } from "@/features/creatures/creature-list";

export const getCreaturesInActivity = (
  creatures: Creature[],
  activity: Hunt
) => {
  if (!activity) return creatures;
  return creatures.filter(
    ({ id, mainCharacterActivityInstances }) =>
      mainCharacterActivityInstances?.[0]?.activity?.id === activity.id &&
      !mainCharacterActivityInstances?.[0]?.isComplete
  );
};

export const getCreaturesNotInActivity = (
  creatures: Creature[],
  activity: Hunt
) => {
  if (!activity) return creatures;
  return creatures.filter(
    ({ id, mainCharacterActivityInstances }) =>
      mainCharacterActivityInstances?.[0]?.activity?.id !== activity.id ||
      mainCharacterActivityInstances?.[0]?.isComplete
  );
};

export const isCreatureInActivity = (creature: Creature, activity: Hunt) => {
  if (!activity) return false;
  return (
    creature.mainCharacterActivityInstances?.[0]?.activity?.id ===
      activity.id && !creature.mainCharacterActivityInstances?.[0]?.isComplete
  );
};

export const getCreatureActiveInstance = (
  creature: Creature,
  activity: Hunt
) => {
  return creature.mainCharacterActivityInstances.find(
    ({ activity: instance }) =>
      instance.id === activity?.id &&
      !creature.mainCharacterActivityInstances?.find(
        ({ isComplete }) => isComplete
      )
  );
};
