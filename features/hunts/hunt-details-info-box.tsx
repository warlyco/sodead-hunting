import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import {
  convertSecondsToDaysAndHoursAndMinutesString,
  formatDateTime,
} from "@/utils/date-time";
import classNames from "classnames";

export const HuntDetailsInfoBox = ({
  hunt,
  className,
  showExpandedInfo = false,
  children,
}: {
  hunt: Hunt;
  className?: string;
  showExpandedInfo?: boolean;
  children?: React.ReactNode;
}) => {
  const {
    startTime,
    endTime,
    maxConcurrentParticipants,
    maxTotalParticipants,
    rewardCollections,
    gateCollections,
    restrictionCollections,
    durationInSeconds,
    name,
  } = hunt;

  return (
    <div
      className={classNames([
        "rounded-2xl p-4 w-full space-y-2 bg-black flex flex-col justify-between bg-opacity-50 font-strange-dreams py-6",
        className,
      ])}
    >
      <div>
        <h2 className="text-5xl tracking-widest mb-6  md:text-right">{name}</h2>
        {!!rewardCollections?.[0] && (
          <div className=" flex w-full justify-end pb-4 tracking-widest space-x-2">
            <div>Reward:</div>
            <div>
              {rewardCollections?.[0]?.itemCollection?.amount}x{" "}
              {rewardCollections?.[0]?.itemCollection?.item?.name}
              {rewardCollections?.[0]?.itemCollection?.amount > 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
      {!!showExpandedInfo && (
        <>
          <div className="flex justify-between pb-2">
            <div>Duration:</div>
            <div>
              {convertSecondsToDaysAndHoursAndMinutesString(durationInSeconds)}
            </div>
          </div>
          <div className="flex justify-between">
            <div>Max concurrent hunters:</div>
            <div>
              {maxConcurrentParticipants > 10000
                ? "Unlimited"
                : maxConcurrentParticipants}
            </div>
          </div>
          <div className="flex justify-between">
            <div>Max total hunters:</div>
            <div>
              {maxTotalParticipants > 10000
                ? "Unlimited"
                : maxTotalParticipants}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/2">Restrictions:</div>
            <div className="w-1/2 ">
              {!!restrictionCollections?.length
                ? restrictionCollections?.map((restirctionCollection, i) => (
                    <div key={restirctionCollection.id}>
                      {restirctionCollection.traitCollection?.name}
                    </div>
                  ))
                : "None"}
            </div>
          </div>
          <div className=" flex w-full justify-end tracking-widest">
            <div className="mr-4">Requirement:</div>
            <div className="text-red-500 font-bold">
              {!!gateCollections.length
                ? gateCollections?.map((gateCollection, i) => (
                    <div key={gateCollection.id}>
                      {gateCollection.traitCollection?.name}
                    </div>
                  ))
                : "None"}
            </div>
          </div>
        </>
      )}
      {!!children && <>{children}</>}
    </div>
  );
};
