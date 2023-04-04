import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { Creature, CreatureList } from "@/features/creatures/creature-list";
import { HuntDetails } from "@/features/hunts/hunt-details";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import client from "@/graphql/apollo/client";
import { GET_CREATURES_BY_TOKEN_MINT_ADDRESSES } from "@/graphql/queries/get-creatures-by-token-mint-addresses";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
import { useUser } from "@/hooks/user";
import { useQuery } from "@apollo/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import collectionHashList from "@/features/hashlist/sodead-full-collection.json";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";

const HuntDetailPage: NextPage = () => {
  const { user, loadingUser } = useUser();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [eligibleCreatures, setEligibleCreatures] = useState<Creature[] | null>(
    null
  );
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [nfts, setNfts] = useState<any[]>([]);

  const filterIneligibleCreatures = useCallback(
    (creatures: Creature[]) => {
      if (!hunt || !hunt.gateCollections?.length) return creatures;

      let eligibleCreatures: Creature[] = [];
      for (let creature of creatures) {
        const traits = creature.traitInstances.map(({ id, value, trait }) => ({
          id,
          value,
          name: trait.name,
        }));

        for (let trait of traits) {
          const { name, value } = trait;

          if (
            hunt.gateCollections?.[0]?.traitCollection?.trait?.name === name &&
            hunt.gateCollections?.[0]?.traitCollection?.value === value
          ) {
            eligibleCreatures.push(creature);
          }
        }
      }

      return eligibleCreatures;
    },
    [hunt]
  );

  const fetchCollection = useCallback(async () => {
    if (!publicKey || !hunt) return;
    setIsLoading(true);

    const nftsWithoutDetailsOne = await fetchNftsByHashList({
      publicKey,
      hashList: collectionHashList,
      connection,
      setHasBeenFetched,
      withDetails: false,
    });

    const mintAddresses = [
      ...nftsWithoutDetailsOne.map(({ mintAddress }) => mintAddress),
    ];

    const { data } = await client.query({
      query: GET_CREATURES_BY_TOKEN_MINT_ADDRESSES,
      variables: {
        mintAddresses: mintAddresses.map((mintAddress) =>
          mintAddress.toString()
        ),
      },
    });

    const { sodead_creatures: creatures }: { sodead_creatures: Creature[] } =
      data;

    setEligibleCreatures(filterIneligibleCreatures([...creatures]));

    setIsLoading(false);
  }, [publicKey, hunt, connection, filterIneligibleCreatures]);

  useEffect(() => {
    if (!publicKey || !user || nfts.length) return;
    fetchCollection();
  }, [connection, fetchCollection, publicKey, nfts, user]);

  const { data: hunts, loading: loadingHunts } = useQuery(GET_HUNT_BY_ID, {
    variables: {
      id: id,
    },
    onCompleted: ({ sodead_activities_by_pk }) => {
      if (!sodead_activities_by_pk) return;
      setHunt(sodead_activities_by_pk);
    },
  });

  if (loadingUser || loadingHunts)
    return (
      <ContentWrapper>
        <Spinner />
      </ContentWrapper>
    );

  if (!user?.accounts?.length)
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <UserWithoutAccountBlocker />
        </div>
      </ContentWrapper>
    );

  if (!hunt)
    return (
      <ContentWrapper>
        <h1>
          Hunt with id {id} not found.{" "}
          <span
            className="text-stone-300 cursor-pointer text-3xl"
            onClick={() => router.push("/")}
          >
            💀
          </span>
        </h1>
      </ContentWrapper>
    );

  return (
    <>
      <div className="w-full relative h-[60vh] md:h-[75vh] mx-auto max-w-[5120px] transition-all duration-300 pointer-events-none">
        <div
          className={classNames(
            "w-full h-full absolute top-16",
            "bg-left md:bg-top"
          )}
          style={{
            backgroundImage: `url(${hunt.imageUrl})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute w-full h-full bg-gradient-to-t from-black to-transparent via-transparent top-16" />
        <div className="absolute w-full h-full top-16 flex">
          <div className="w-1/2"></div>
          <div className="w-1/2">
            <div className="flex-col items-center justify-center pt-0 hidden md:flex h-full max-w-3xl mx-auto">
              <HuntDetails hunt={hunt} />
            </div>
          </div>
        </div>
      </div>
      <ContentWrapper className="flex flex-col items-center pt-0 -mt-16 md:mt-0 md:pt-28">
        <div className="md:hidden mx-auto mb-8 w-full flex flex-col items-center space-y-8">
          <HuntDetails hunt={hunt} />
        </div>
        <div className="flex w-full flex-wrap">
          <div className="w-full lg:w-1/2">
            <CreatureList
              creatures={eligibleCreatures}
              isLoading={isLoading}
              title="Your Vamps"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <CreatureList
              creatures={[]}
              isLoading={isLoading}
              title="Vamps on Hunt"
            />
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default HuntDetailPage;
