import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { useAdmin } from "@/hooks/admin";
import { useDebugMode } from "@/hooks/debug-mode";
import {
  convertSecondsToDaysAndHoursAndMinutesString,
  formatDateTime,
} from "@/utils/date-time";
import classNames from "classnames";
import { useEffect } from "react";

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
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const { isAdmin } = useAdmin();
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
        "rounded-2xl p-4 w-full mx-auto text-xl space-y-2 bg-black flex flex-col justify-between bg-opacity-50 font-strange-dreams py-6",
        className,
      ])}
    >
      <>
        <div className="flex justify-between pb-2">
          <div>Duration:</div>
          <div>
            {convertSecondsToDaysAndHoursAndMinutesString(durationInSeconds)}
          </div>
        </div>
        {!!isDebugMode && isAdmin && (
          <>
            <div className="flex justify-between pb-4">
              <div>Max concurrent hunters:</div>
              <div>
                {maxConcurrentParticipants > 10000
                  ? "Unlimited"
                  : maxConcurrentParticipants}
              </div>
            </div>
            <div className="flex justify-between pb-4">
              <div>Max total hunters:</div>
              <div>
                {maxTotalParticipants > 10000
                  ? "Unlimited"
                  : maxTotalParticipants}
              </div>
            </div>
            <div className="flex justify-between pb-4">
              <div className="mr-4">Gates:</div>
              <div className="text-red-500 font-bold text-right">
                {!!gateCollections?.length
                  ? gateCollections?.map((restirctionCollection, i) => (
                      <div key={restirctionCollection.id}>
                        {restirctionCollection.traitCollection?.name}
                      </div>
                    ))
                  : "None"}
              </div>
            </div>
            <div className="flex justify-between pb-4">
              <div className="mr-4">Restrictions:</div>
              <div className="text-red-500 font-bold text-right">
                {!!restrictionCollections?.length
                  ? restrictionCollections?.map((restirctionCollection, i) => (
                      <div key={restirctionCollection.id}>
                        {restirctionCollection.traitCollection?.name}
                      </div>
                    ))
                  : "None"}
              </div>
            </div>
          </>
        )}
        {!!gateCollections.length && (
          <div className="flex justify-between">
            <div className="mr-4">Requirement:</div>
            <div className="text-red-500 font-bold text-right">
              {gateCollections?.map((gateCollection, i) => (
                <div key={gateCollection.id}>
                  {gateCollection.traitCollection?.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
      {!!children && <>{children}</>}
    </div>
  );
};
