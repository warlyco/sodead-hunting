import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import {
  convertSecondsToDaysAndHoursAndMinutesString,
  formatDateTime,
} from "@/utils/date-time";
import classNames from "classnames";

export const HuntDetailsInfoBox = ({
  hunt,
  className,
}: {
  hunt: Hunt;
  className?: string;
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
  } = hunt;

  return (
    <div
      className={classNames([
        "border-2 rounded-2xl border-red-500 p-4 w-full max-w-sm space-y-2 bg-stone-900 flex flex-col justify-center",
        className,
      ])}
    >
      <div className="flex justify-between">
        <div>Start time:</div>
        <div>{formatDateTime(startTime)}</div>
      </div>
      <div className="flex justify-between">
        <div>End time:</div>
        <div>{formatDateTime(endTime)}</div>
      </div>
      <div className="flex justify-between">
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
          {maxTotalParticipants > 10000 ? "Unlimited" : maxTotalParticipants}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="w-1/2">Requirement:</div>
        <div className="w-1/2 text-right">
          {!!gateCollections.length
            ? gateCollections?.map((gateCollection, i) => (
                <div key={gateCollection.id}>
                  {gateCollection.traitCollection?.name}
                </div>
              ))
            : "None"}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="w-1/2">Restrictions:</div>
        <div className="w-1/2 text-right">
          {!!restrictionCollections?.length
            ? restrictionCollections?.map((restirctionCollection, i) => (
                <div key={restirctionCollection.id}>
                  {restirctionCollection.traitCollection?.name}
                </div>
              ))
            : "None"}
        </div>
      </div>
      {!!rewardCollections?.[0] && (
        <div className="flex justify-between">
          <div>Reward:</div>
          <div>
            {rewardCollections?.[0]?.itemCollection?.amount}x{" "}
            {rewardCollections?.[0]?.itemCollection?.item?.name}
            {rewardCollections?.[0]?.itemCollection?.amount > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};
