import { Creature } from "@/features/creatures/creature-list";
import { useDebugMode } from "@/hooks/debug-mode";
import { formatDate, formatDateTime } from "@/utils/date-time";
import classNames from "classnames";
import Image from "next/image";
import { useEffect, useState } from "react";

export const CreatureListItem = ({
  creature,
  className,
  isSelected = false,
  activityId,
}: {
  creature: Creature;
  className?: string;
  isSelected?: boolean;
  activityId?: string;
}) => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const [activityInstance, setActivityInstance] =
    useState<Creature["mainCharacterActivityInstances"][0]>();

  useEffect(() => {
    setIsDebugMode(true);
    setActivityInstance(
      creature.mainCharacterActivityInstances.find(
        ({ activity }) => activity.id === activityId
      )
    );
  }, [activityId, creature.mainCharacterActivityInstances, setIsDebugMode]);

  return (
    <>
      <div
        className={classNames([
          "border-rounded-2xl rounded-lg overflow-hidden",
          isSelected
            ? "border-yellow-500 shadow-yellow-500 shadow-inner border-8"
            : "border-red-800 border-4",
        ])}
      >
        <Image
          src={creature.imageUrl}
          alt={creature.name}
          className="w-full h-full object-cover"
          width={500}
          height={500}
        />
        {!!activityInstance && (
          <div className="p-2">
            Ends:
            <br />
            {formatDateTime(activityInstance.endTime)}
          </div>
        )}
      </div>
      {!!isDebugMode && (
        <div className="p-2">
          {creature.traitInstances.map(({ id, value, trait }) => (
            <div key={id} className="flex w-full justify-between">
              <div>{trait.name}</div>
              <div>{value}</div>
            </div>
          ))}
          <div className="flex w-full justify-between">
            <div>Mint </div>
            <div className="w-3/4 break-all">{creature.token.mintAddress}</div>
          </div>
        </div>
      )}
    </>
  );
};
