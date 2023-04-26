import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { Creature } from "@/features/creatures/creature-list";
import showToast from "@/features/toasts/show-toast";
import { GET_CREATURE_BY_ID } from "@/graphql/queries/get-creature-by-id";
import { GET_CREATURE_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-creature-by-token-mint-address";
import { GET_PAYOUTS_BY_CREATURE_ID } from "@/graphql/queries/get-payouts-by-creature-id";
import { useAdmin } from "@/hooks/admin";
import { useUser } from "@/hooks/user";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { getHashForTraitCombination } from "@/utils/nfts/get-hash-for-trait-combination";
import { getTraitsFromTraitInstances } from "@/utils/nfts/get-traits-from-trait-instances";
import { useLazyQuery, useQuery } from "@apollo/client";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

export type Payout = {
  id: string;
  amount: number;
  txAddress: string;
  createdAtWithTimezone: string;
  item: {
    id: string;
    name: string;
    imageUrl: string;
  };
  wallet: {
    id: string;
    address: string;
  };
  token: {
    id: string;
    name: string;
    imageUrl: string;
    mintAddress: string;
    items: {
      id: string;
      name: string;
      imageUrl: string;
    }[];
    creatures: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
};

export type ModeledTrait = {
  id?: string;
  name: string;
  value: string;
};

const ProfilePage: NextPage = () => {
  const wallet = useWallet();
  const { isAdmin } = useAdmin();
  const { user, loadingUser } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [creature, setCreature] = useState<Creature | null>(null);
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [traits, setTraits] = useState<ModeledTrait[] | null>(null);
  const [traitCombinationHash, setTraitCombinationHash] = useState<
    string | null
  >(null);
  const [isVerifiedTraitHash, setIsVerifiedTraitHash] =
    useState<boolean>(false);
  const [isUpdatingCreature, setIsUpdatingCreature] = useState<boolean>(false);

  const verifyTraitCombination = async (traits: ModeledTrait[]) => {
    const { data } = await axios.post(
      `${BASE_URL}/api/trait-combination-exists`,
      {
        combinations: traits,
      }
    );
    setIsVerifiedTraitHash(data?.exists);
  };

  const updateDisplayedCreatureInfo = (creature: Creature) => {
    setCreature(creature);
    setIsUpdatingCreature(false);
    const traits: ModeledTrait[] = getTraitsFromTraitInstances(
      creature?.traitInstances
    );
    verifyTraitCombination(traits);
    setTraits(traits);
    setTraitCombinationHash(creature?.traitCombinationHash || "");
  };

  const isPublicKey = (id: string | string[]) => {
    if (Array.isArray(id)) return false;

    try {
      return !!new PublicKey(id);
    } catch (error) {
      return false;
    }
  };

  const { loading, refetch } = useQuery(GET_CREATURE_BY_ID, {
    variables: {
      id,
    },
    skip: !id || isPublicKey(id),
    fetchPolicy: "network-only",
    onCompleted: async ({
      sodead_creatures_by_pk,
    }: {
      sodead_creatures_by_pk: Creature;
    }) => {
      console.log({ sodead_creatures_by_pk });
      updateDisplayedCreatureInfo(sodead_creatures_by_pk);
    },
  });

  const { loading: loadingByMintAddress } = useQuery(
    GET_CREATURE_BY_TOKEN_MINT_ADDRESS,
    {
      variables: {
        mintAddress: id,
      },
      skip: !id || !isPublicKey(id),
      fetchPolicy: "network-only",
      onCompleted: async ({ sodead_creatures }) => {
        console.log({ sodead_creatures });
        updateDisplayedCreatureInfo(sodead_creatures?.[0]);
      },
    }
  );

  const { loading: payoutsLoading } = useQuery(GET_PAYOUTS_BY_CREATURE_ID, {
    variables: {
      id,
    },
    skip: !id,
    onCompleted: ({ sodead_payouts }) => {
      console.log({ sodead_payouts });
      setPayouts(sodead_payouts);
    },
  });

  const updateCreature = async () => {
    setIsUpdatingCreature(true);
    console.log({ creature });

    const { data } = await axios.post(
      `${BASE_URL}/api/update-creature-by-mint-address`,
      {
        mintAddress: creature?.token.mintAddress,
      }
    );
    setTimeout(() => {
      refetch();
      showToast({
        primaryMessage: "Tokena & creature updated from Solana",
      });
      setIsUpdatingCreature(false);
    }, 100);
    console.log({ data });
  };

  if (!isAdmin) return <NotAdminBlocker />;

  if (loading || loadingUser || payoutsLoading || loadingByMintAddress)
    return (
      <ContentWrapper>
        <div className="flex s-full justify-center">
          <Spinner />
        </div>
      </ContentWrapper>
    );

  if (!creature) {
    return (
      <ContentWrapper>
        <div className="flex s-full justify-center">
          <div className="text-5xl font-strange-dreams text-center mb-12 tracking-wider">
            Creature not found
          </div>
        </div>
      </ContentWrapper>
    );
  }

  const { name } = creature;

  return (
    <ContentWrapper className="flex flex-wrap">
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <Image
          src={creature.imageUrl}
          alt={creature.name}
          className="w-96 h-96 mb-8 rounded-xl"
          width={500}
          height={500}
        />
        <h1 className="text-4xl font-strange-dreams text-center mb-4 tracking-wider">
          {name}
        </h1>
        <div className="flex w-full justify-between mb-4 max-w-xs text-2xl font-strange-dreams">
          <div>Mint</div>
          <div className="break-all">
            {getAbbreviatedAddress(creature.token.mintAddress)}
          </div>
          <a
            className="flex justify-center items-center underline"
            href={`https://explorer.solana.com/address/${creature.token.mintAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/images/solana-logo.svg"
              width={12}
              height={12}
              alt="Solana"
            />
          </a>
        </div>
        <div className="flex flex-wrap w-full justify-between mb-16 max-w-xs text-2xl font-strange-dreams">
          <div>Trait Hash:</div>
          <div className="break-all mb-2">
            {getAbbreviatedAddress(creature.traitCombinationHash || "")}
          </div>
          {!!isVerifiedTraitHash && (
            <div className="flex w-full items-center space-x-2 py-2">
              <CheckBadgeIcon className="w-6 h-6 text-green-500" />
              <div>Verified</div>
            </div>
          )}
          <PrimaryButton
            className="flex mt-4 w-full justify-center"
            onClick={updateCreature}
          >
            {isUpdatingCreature ? <Spinner /> : "Update Creature"}
          </PrimaryButton>
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <div className="max-w-md w-full text-xl leading-8 font-strange-dreams mb-16 px-4">
          <h2 className="text-3xl font-strange-dreams text-center mb-8 tracking-wider">
            Traits
          </h2>
          {!!traits &&
            traits.map(({ id, value, name }) => (
              <div key={id} className="flex w-full justify-between">
                <div>{name}</div>
                <div>{value}</div>
              </div>
            ))}
          <h2 className="text-3xl font-strange-dreams text-center mb-4 tracking-wider mt-8">
            Payouts
          </h2>
          {!!payouts?.length &&
            payouts.map(
              ({ id, token, amount, createdAtWithTimezone, txAddress }) => (
                <div
                  key={id}
                  className="flex w-full justify-between text-base leading-8"
                >
                  <div>{formatDateTime(createdAtWithTimezone)}</div>
                  <div>{token?.items?.[0]?.name}</div>
                  <div>{amount}</div>
                  <a
                    className="flex justify-center items-center underline"
                    href={`https://explorer.solana.com/tx/${txAddress}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image
                      src="/images/solana-logo.svg"
                      width={12}
                      height={12}
                      alt="Solana"
                    />
                  </a>
                </div>
              )
            )}
        </div>
      </div>
    </ContentWrapper>
  );
};

export default ProfilePage;
