import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { formatDateTime } from "@/utils/date-time";

export const HuntDetails = ({ hunt }: { hunt: Hunt }) => {
  const {
    name,
    description,
    startTime,
    endTime,
    maxConcurrentParticipants,
    maxTotalParticipants,
    rewardCollections,
  } = hunt;

  return (
    <>
      <h1 className="text-5xl xl:mb-8 text-center font-strange-dreams tracking-wider">
        {name}
      </h1>
      <div className="xl:text-lg tracking-wider mb-8 leading-8 xl:leading-relaxed px-8">
        {description}
      </div>
      <div className="border-2 rounded-2xl border-red-500 p-4 w-full max-w-sm space-y-2">
        <div className="flex justify-between">
          <div>Start time:</div>
          <div>{formatDateTime(startTime)}</div>
        </div>
        <div className="flex justify-between">
          <div>End time:</div>
          <div>{formatDateTime(endTime)}</div>
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
    </>
  );
};
