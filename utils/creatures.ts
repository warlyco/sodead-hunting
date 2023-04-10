import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { Creature } from "@/features/creatures/creature-list";

// export const getCreaturesInActivity = (
//   creatures: Creature[],
//   activity: Hunt
// ) => {
//   if (!activity) return creatures;
//   return creatures.filter(
//     ({ id, mainCharacterActivityInstances }) =>
//       mainCharacterActivityInstances?.[0]?.activity?.id === activity.id &&
//       !mainCharacterActivityInstances?.[0]?.isComplete
//   );
// };

// export const getCreaturesNotInActivity = (
//   creatures: Creature[],
//   activity: Hunt
// ) => {
//   if (!activity) return creatures;
//   return creatures.filter(
//     ({ id, mainCharacterActivityInstances }) =>
//       mainCharacterActivityInstances?.[0]?.activity?.id !== activity.id ||
//       mainCharacterActivityInstances?.[0]?.isComplete
//   );
// };

export const getCreatureActiveInstance = (creature: Creature) => {
  return creature.mainCharacterActivityInstances.find(
    ({ isComplete }) => !isComplete
  );
};

export const getCreaturesInActivity = (
  creatures: Creature[],
  activity: Hunt
) => {
  if (!activity) return creatures;
  // sort by mainCharacterActivityInstances where isComplete is false
  return creatures
    .filter(
      (creature) =>
        getCreatureActiveInstance(creature)?.activity?.id === activity.id
    )
    .sort((a, b) => {
      const aActiveInstance = getCreatureActiveInstance(a);
      const bActiveInstance = getCreatureActiveInstance(b);
      if (!aActiveInstance || !bActiveInstance) return 0;

      return (
        new Date(aActiveInstance.startTime).getTime() -
        new Date(bActiveInstance.startTime).getTime()
      );
    });
};

export const getCreaturesNotInActivity = (
  creatures: Creature[],
  activity: Hunt
) => {
  if (!activity) return creatures;
  return creatures.filter(
    (creature) =>
      getCreatureActiveInstance(creature)?.activity?.id !== activity.id
  );
};
