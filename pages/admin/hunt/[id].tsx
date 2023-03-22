import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
import { Panel } from "@/features/UI/panel";
import { formatDateTime } from "@/utils/date-time";
import { formatNumberWithCommas } from "@/utils/formatting";

const HuntDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const { isAdmin } = useAdmin();

  const { loading, error } = useQuery(GET_HUNT_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({ sodead_hunts_by_pk }) => {
      setHunt(sodead_hunts_by_pk);
      setHasBeenFetched(true);
    },
  });

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!hunt && hasBeenFetched && <div>Item not found</div>}
      {!!hunt && (
        <>
          <ContentWrapper>
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full mx-auto">
              <Panel className="flex flex-col items-center text-xl">
                <div className="mb-8">
                  <ImageWithFallback
                    className="rounded-2xl shadow-xl border border-stone-800 w-32 h-32 object-contain object-center"
                    src={hunt.imageUrl || ""}
                    width={350}
                    height={350}
                    alt="hunt image"
                  />
                </div>
                <h1 className="text-3xl mb-6">{hunt.name}</h1>
                <div className="text-lg italic mb-8">{hunt.description}</div>
                <div className="flex w-full justify-between mb-4">
                  <div>Start time:</div>
                  <div>{formatDateTime(hunt.startTime)}</div>
                </div>
                <div className="flex w-full justify-between mb-4">
                  <div>End time:</div>
                  <div>{formatDateTime(hunt.endTime)}</div>
                </div>
                <div className="flex w-full justify-between mb-4">
                  <div>Maximum concurrent hunters:</div>
                  <div>{formatNumberWithCommas(hunt.maxConcurrentHunters)}</div>
                </div>
                <div className="flex w-full justify-between mb-4">
                  <div>Maximum total hunters:</div>
                  <div>{formatNumberWithCommas(hunt.maxTotalHunters)}</div>
                </div>
              </Panel>
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
};

export default HuntDetailPage;
