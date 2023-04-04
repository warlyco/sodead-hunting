import { Creature } from "@/features/creatures/creature-list";
import classNames from "classnames";
import Image from "next/image";

export const CreatureListItem = ({
  creature,
  className,
  isSelected = false,
}: {
  creature: Creature;
  className?: string;
  isSelected?: boolean;
}) => {
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
      </div>
      {/* <div className="p-2">
        {creature.traitInstances.map(({ id, value, trait }) => (
          <div key={id} className="flex w-full justify-between">
            <div>{trait.name}</div>
            <div>{value}</div>
          </div>
        ))}
      </div> */}
    </>
  );
};
