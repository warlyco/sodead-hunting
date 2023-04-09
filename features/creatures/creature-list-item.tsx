import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import CountdownTimer from "@/features/countdown/coundown-timer";
import { Creature } from "@/features/creatures/creature-list";
import { useDebugMode } from "@/hooks/debug-mode";
import {
  getCreatureActiveInstance,
  getCreaturesNotInActivity,
} from "@/utils/creatures";
import { formatDate, formatDateTime } from "@/utils/date-time";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useState } from "react";

export const CreatureListItem = ({
  creature,
  className,
  isSelected = false,
  activity,
}: {
  creature: Creature;
  className?: string;
  isSelected?: boolean;
  activity?: Hunt;
}) => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const [activityInstance, setActivityInstance] =
    useState<Creature["mainCharacterActivityInstances"][0]>();

  useEffect(() => {
    if (!activity) return;
    setIsDebugMode(true);
    getCreaturesNotInActivity([creature], activity)[0];
    setActivityInstance(getCreatureActiveInstance(creature, activity));
  }, [
    activity,
    creature,
    creature.mainCharacterActivityInstances,
    setIsDebugMode,
  ]);

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
        {!!activityInstance?.endTime && (
          <div className="-mt-16 bg-gradient-to-t from-black via-black to-transparent relative text-stone-300">
            <div className="h-16 flex flex-col items-center justify-center">
              <CountdownTimer
                endsAt={new Date(activityInstance.endTime).getTime()}
              />
            </div>
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
