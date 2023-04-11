import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { HuntDetailsInfoBox } from "@/features/hunts/hunt-details-info-box";
import { formatDateTime } from "@/utils/date-time";

export const HuntDetails = ({ hunt }: { hunt: Hunt }) => {
  const { name, description, rewardCollections } = hunt;

  return (
    <>
      <h1 className="text-5xl lg:text-6xl lg:mb-8 text-center font-strange-dreams tracking-wider small-caps">
        {name}
      </h1>
      <div className="text-xl xl:text-2xl tracking-wider mb-8 leading-8 xl:leading-relaxed px-8 py-4 bg-stone-900 rounded-2xl small-caps italic">
        {description}
      </div>
      <>
        {!!rewardCollections?.[0] && (
          <div className="flex w-full px-8 pb-8 tracking-widest space-x-2 font-strange-dreams text-3xl small-caps">
            <div>Reward:</div>
            <div>
              {rewardCollections?.[0]?.itemCollection?.amount}x{" "}
              {rewardCollections?.[0]?.itemCollection?.item?.name}
              {rewardCollections?.[0]?.itemCollection?.amount > 1 ? "s" : ""}
            </div>
          </div>
        )}
      </>
      <div className="px-4 w-full">
        <HuntDetailsInfoBox hunt={hunt} />
      </div>
    </>
  );
};
