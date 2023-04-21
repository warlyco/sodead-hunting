import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { Creature, CreatureList } from "@/features/creatures/creature-list";
import { HuntDetails } from "@/features/hunts/hunt-details";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { GET_CREATURES_BY_TOKEN_MINT_ADDRESSES } from "@/graphql/queries/get-creatures-by-token-mint-addresses";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
import { useUser } from "@/hooks/user";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import classNames from "classnames";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import collectionHashList from "@/features/hashlist/sodead-full-collection.json";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import {
  getCreaturesInActivity,
  getCreaturesNotInActivity,
} from "@/utils/creatures";
import dayjs from "dayjs";
import { RemoveFromHuntResponse } from "@/pages/api/remove-from-hunt";

const HuntDetailPage: NextPage = () => {
  const { user, loadingUser, setUser } = useUser();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [eligibleCreatures, setEligibleCreatures] = useState<Creature[] | null>(
    null
  );
  const [creaturesInActivity, setCreaturesInActivity] = useState<Creature[]>(
    []
  );
  const [creatureMintAddresses, setCreatureMintAddresses] = useState<string[]>(
    []
  );
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [nfts, setNfts] = useState<any[]>([]);
  const [selectedCreatures, setSelectedCreatures] = useState<Creature[]>([]);
  const [
    selectedActivityCompleteCreatures,
    setSelectedActivityCompleteCreatures,
  ] = useState<Creature[]>([]);

  const [getCreaturesByTokenMintAddress, { loading: creaturesLoading }] =
    useLazyQuery(GET_CREATURES_BY_TOKEN_MINT_ADDRESSES, {
      variables: {
        mintAddresses: creatureMintAddresses.map((mintAddress) =>
          mintAddress.toString()
        ),
      },
      fetchPolicy: "no-cache",
      onCompleted: async ({
        sodead_creatures: creatures,
      }: {
        sodead_creatures: Creature[];
      }) => {
        if (!hunt || !publicKey) return;

        setEligibleCreatures(filterIneligibleCreatures(creatures));
        const creaturesInActivity = getCreaturesInActivity(creatures, hunt);
        console.log({ creaturesInActivity });

        // check if listed, invalidate
        if (creaturesInActivity?.length) {
          // find earliest start time
          let earliestStartTime;
          for (let creature of creaturesInActivity) {
            const activityInstanceStartTime =
              creature.mainCharacterActivityInstances.find(
                ({ isComplete }) => !isComplete
              )?.startTime || 0;

            if (
              !earliestStartTime ||
              activityInstanceStartTime < earliestStartTime
            ) {
              earliestStartTime = activityInstanceStartTime;
            }
          }

          if (!earliestStartTime) return;
          const startTime = dayjs(earliestStartTime).unix();

          const { data } = await axios.post(
            `${BASE_URL}/api/get-nft-listings-by-wallet-address`,
            {
              walletAddress: publicKey?.toString(),
              startTime,
            }
          );
          console.log({ data, earliestStartTime });

          if (data?.nfts?.length) {
            const mainCharacterMintAddresses = data.nfts.map(
              ({ mint }: { mint: string }) => mint
            );

            const mainCharacterIds = mainCharacterMintAddresses
              .map((mintAddress: string) => {
                const creature = creaturesInActivity.find(
                  (c) => c.token.mintAddress === mintAddress
                );
                return creature?.id;
              })
              .filter((id: string) => id);

            console.log({ mainCharacterIds });

            if (!mainCharacterIds.length) {
              setCreaturesInActivity(creaturesInActivity);
              setIsLoading(false);
              return;
            }

            await axios.post(`${BASE_URL}/api/remove-from-hunt`, {
              huntId: hunt.id,
              mainCharacterIds,
              walletAddress: publicKey.toString(),
              shouldInvalidate: true,
            });
            const numberOfInvalidated = mainCharacterIds.length;
            showToast({
              primaryMessage: "Invalidation",
              secondaryMessage: `
                ${numberOfInvalidated} ${
                numberOfInvalidated === 1 ? "Vamp" : "Vamps"
              } removed from hunt due to being listed on the marketplace.
              `,
            });
          }
          setCreaturesInActivity(creaturesInActivity);
        }
        setIsLoading(false);
      },
    });

  const filterIneligibleCreatures = useCallback(
    (creatures: Creature[]) => {
      if (!hunt) return creatures;

      let eligibleCreatures: Creature[] = [];
      for (let creature of creatures) {
        const traits = creature.traitInstances.map(({ id, value, trait }) => ({
          id,
          value,
          name: trait.name,
        }));

        if (!hunt.gateCollections?.length) {
          eligibleCreatures.push(creature);
        } else {
          for (let trait of traits) {
            const { name, value } = trait;

            for (let gateCollection of hunt.gateCollections) {
              if (
                gateCollection.traitCollection?.trait?.name === name &&
                gateCollection.traitCollection?.value === value
              ) {
                // only add to eligible creatures if uniqye
                if (
                  !eligibleCreatures.find(
                    (c) => c.id === creature.id && c.id === creature.id
                  )
                ) {
                  eligibleCreatures.push(creature);
                }
              }
            }
          }
        }

        if (hunt?.restrictionCollections?.length) {
          for (let trait of traits) {
            const { name, value } = trait;

            for (let restrictionCollection of hunt.restrictionCollections) {
              if (
                restrictionCollection.traitCollection?.trait?.name === name &&
                restrictionCollection.traitCollection?.value === value
              ) {
                // remove from eligible creatures
                eligibleCreatures = eligibleCreatures.filter(
                  ({ id }) => id !== creature.id
                );
              }
            }
          }
        }
      }

      const creaturesActiveInOtherActivity = eligibleCreatures
        .filter((creature) =>
          creature.mainCharacterActivityInstances.find(
            ({ isComplete }) => !isComplete
          )
        )
        .filter((creature) =>
          creature.mainCharacterActivityInstances.find(
            ({ activity }) => activity.id !== hunt.id
          )
        );

      console.log({ creaturesActiveInOtherActivity });

      return getCreaturesNotInActivity(
        eligibleCreatures.filter(
          (creature) => !creaturesActiveInOtherActivity.includes(creature)
        ),
        hunt
      );

      // return getCreaturesNotInActivity(eligibleCreatures, hunt);
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

    setCreatureMintAddresses(mintAddresses);
    getCreaturesByTokenMintAddress();
  }, [publicKey, hunt, connection, getCreaturesByTokenMintAddress]);

  const selectAllComplete = () => {
    // bug: selects any creature that has completed this activity previously
    const allCompleteCreatures = creaturesInActivity.filter(
      ({ mainCharacterActivityInstances }) =>
        mainCharacterActivityInstances.find(
          ({ activity, isComplete }) => activity.id === id && isComplete
        )
    );
    !!allCompleteCreatures &&
      setSelectedActivityCompleteCreatures(allCompleteCreatures);
  };

  const removeFromHunt = useCallback(async () => {
    if (!publicKey || !hunt) return;

    setIsLoading(true);

    try {
      const { data }: { data: RemoveFromHuntResponse } = await axios.post(
        `${BASE_URL}/api/remove-from-hunt`,
        {
          huntId: hunt.id,
          mainCharacterIds: selectedActivityCompleteCreatures.map(
            ({ id }) => id
          ),
          walletAddress: publicKey.toString(),
        }
      );
      const { reward, rewardTxAddress } = data;

      showToast({
        primaryMessage: "Hunt successful!",
        secondaryMessage: `You received ${reward.amount} ${reward.item.name}.`,
        link: {
          url: `https://explorer.solana.com/tx/${rewardTxAddress}`,
          title: "View Transaction",
        },
      });
      setCreaturesInActivity(
        creaturesInActivity.filter(
          ({ id }) =>
            !selectedActivityCompleteCreatures.map(({ id }) => id).includes(id)
        )
      );
      setEligibleCreatures([
        ...(eligibleCreatures || []),
        ...selectedActivityCompleteCreatures,
      ]);
      setSelectedActivityCompleteCreatures([]);
      fetchCollection();
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  }, [
    creaturesInActivity,
    eligibleCreatures,
    fetchCollection,
    hunt,
    publicKey,
    selectedActivityCompleteCreatures,
  ]);

  const addToHunt = useCallback(async () => {
    if (!publicKey || !hunt) return;

    setIsLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/add-to-hunt`, {
        huntId: hunt.id,
        mainCharacterIds: selectedCreatures.map(({ id }) => id),
      });
      showToast({
        primaryMessage: "Vampires sent on hunt!",
      });
      setCreaturesInActivity([...creaturesInActivity, ...selectedCreatures]);
      setEligibleCreatures(
        filterIneligibleCreatures(
          eligibleCreatures?.filter(
            ({ id }) => !selectedCreatures.map(({ id }) => id).includes(id)
          ) || []
        )
      );
      setSelectedCreatures([]);
      await fetchCollection();
    } catch (error) {
      console.log(error);
    }
  }, [
    publicKey,
    hunt,
    selectedCreatures,
    creaturesInActivity,
    filterIneligibleCreatures,
    eligibleCreatures,
    fetchCollection,
  ]);

  useEffect(() => {
    if (user && !publicKey) {
      setUser(null);
    }
    if (!publicKey || !user || nfts.length) return;
    fetchCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <Spinner />
        </div>
      </ContentWrapper>
    );

  if (!!hunt?.id && !hunt?.isActive) {
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">No hunt found</div>
      </ContentWrapper>
    );
  }

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
      <div className="w-full relative h-[60vh] md:h-[85vh] mx-auto max-w-[5120px] transition-all duration-300 pointer-events-none">
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
          <div className="hidden md:block w-1/2 md:mt-8">
            <HuntDetails hunt={hunt} />
          </div>
        </div>
      </div>
      <ContentWrapper className="flex flex-col items-center pt-0 -mt-16 md:mt-0 md:pt-28 max-w-7xl">
        <div className="md:hidden mx-auto mb-8 w-full flex flex-col items-center space-y-8">
          <HuntDetails hunt={hunt} />
        </div>
        <div className="flex w-full flex-wrap">
          <div className="text-xl xl:text-2xl tracking-wider mb-12 leading-8 xl:leading-relaxed px-8 py-4 bg-stone-900 bg-opacity-50 rounded-2xl small-caps italic mx-8">
            {hunt.description}
          </div>
          <div className="w-full lg:w-1/2 px-4 flex flex-col">
            <div className="text-4xl font-strange-dreams text-center mb-12 tracking-wider">
              Your Vamps
            </div>
            <div className="mx-auto pb-8">
              <SubmitButton
                className="shadow-2xl"
                isSubmitting={false}
                onClick={addToHunt}
                disabled={!selectedCreatures.length || isLoading}
              >
                Send Selected on hunt
              </SubmitButton>
            </div>

            <CreatureList
              activity={hunt}
              creatures={eligibleCreatures}
              isLoading={isLoading}
              selectedCreatures={selectedCreatures}
              setSelectedCreatures={setSelectedCreatures}
            />
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div className="text-4xl font-strange-dreams text-center mb-12 tracking-wider">
              Vamps on Hunt
            </div>
            <div className="mx-auto pb-8 flex w-full justify-center space-x-4">
              <SubmitButton
                isSubmitting={false}
                onClick={removeFromHunt}
                disabled={
                  !selectedActivityCompleteCreatures.length || isLoading
                }
              >
                Claim Rewards
              </SubmitButton>
            </div>
            <CreatureList
              activity={hunt}
              creatures={creaturesInActivity}
              isLoading={isLoading}
              selectedCreatures={selectedActivityCompleteCreatures}
              setSelectedCreatures={setSelectedActivityCompleteCreatures}
            />
          </div>
        </div>
      </ContentWrapper>
    </>
  );
};

export default HuntDetailPage;
