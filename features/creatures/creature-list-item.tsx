import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import CountdownTimer from "@/features/countdown/coundown-timer";
import { Creature } from "@/features/creatures/creature-list";
import { useDebugMode } from "@/hooks/debug-mode";
import {
  getCreatureActiveInstance,
  getCreaturesNotInActivity,
} from "@/utils/creatures";
import classNames from "classnames";
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
  const { isDebugMode } = useDebugMode();
  const [activityInstance, setActivityInstance] =
    useState<Creature["mainCharacterActivityInstances"][0]>();

  useEffect(() => {
    if (!activity) return;
    getCreaturesNotInActivity([creature], activity)[0];
    setActivityInstance(getCreatureActiveInstance(creature));
  }, [activity, creature, creature.mainCharacterActivityInstances]);

  return (
    <>
      <div
        className={classNames([
          "rounded-2xl overflow-hidden border-8",
          isSelected
            ? "border-red-800 shadow-red-800 shadow-inner border-6"
            : " border-transparent",
        ])}
      >
        <Image
          src={creature.imageUrl}
          alt={creature.name}
          className={classNames([
            "w-full h-full object-cover",
            isSelected ? "rounded" : "rounded-2xl",
          ])}
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
          {/* <Link
            className="underline mb-2 text-center"
            href={`/profile/${creature.id}`}
          >
            Profile page
          </Link> */}
          {/* {creature.traitInstances.map(({ id, value, trait }) => (
            <div key={id} className="flex w-full justify-between">
              <div>{trait.name}</div>
              <div>{value}</div>
            </div>
          ))} */}
          <div className="flex flex-col w-full justify-between">
            <div className="font-bold">Mint:</div>
            <div className="break-all">{creature.token.mintAddress}</div>
          </div>
        </div>
      )}
    </>
  );
};
