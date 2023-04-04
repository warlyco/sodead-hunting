import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { HuntDetailsInfoBox } from "@/features/hunts/hunt-details-info-box";
import { formatDateTime } from "@/utils/date-time";

export const HuntDetails = ({ hunt }: { hunt: Hunt }) => {
  const { name, description } = hunt;

  return (
    <>
      <h1 className="text-4xl lg:text-5xl lg:mb-8 text-center font-strange-dreams tracking-wider">
        {name}
      </h1>
      <div className="xl:text-lg tracking-wider mb-8 leading-8 xl:leading-relaxed px-8 py-4 bg-stone-900 rounded-2xl">
        {description}
      </div>
      <HuntDetailsInfoBox hunt={hunt} />
    </>
  );
};
