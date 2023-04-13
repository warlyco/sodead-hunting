import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { HuntDetailsInfoBox } from "@/features/hunts/hunt-details-info-box";
import { formatDateTime } from "@/utils/date-time";

export const HuntDetails = ({ hunt }: { hunt: Hunt }) => {
  const { name, description, rewardCollections } = hunt;

  return (
    <>
      <h1 className="text-5xl lg:text-6xl lg:mb-12 text-center font-strange-dreams tracking-wider small-caps">
        {name}
      </h1>
      <>
        {!!rewardCollections?.[0] && (
          <div className="flex w-full px-8 mb-16 tracking-widest space-x-2 font-strange-dreams text-3xl small-caps justify-center">
            <div>Reward:</div>
            <div>
              {rewardCollections?.[0]?.itemCollection?.amount}x{" "}
              {rewardCollections?.[0]?.itemCollection?.item?.name}
              {rewardCollections?.[0]?.itemCollection?.amount > 1 ? "s" : ""}
            </div>
          </div>
        )}
      </>
      <div className="px-4 w-full mx-auto max-w-lg">
        <HuntDetailsInfoBox hunt={hunt} />
      </div>
    </>
  );
};
