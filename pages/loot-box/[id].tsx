import { BASE_URL, BURNING_WALLET_ADDRESS } from "@/constants/constants";
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { LootBoxRewards } from "@/features/loot-boxes/loot-box-rewards-list";
import showToast from "@/features/toasts/show-toast";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { ADD_BURN_ATTEMPT } from "@/graphql/mutations/add-burn-attempt";
import { GET_HASH_LIST_BY_ID } from "@/graphql/queries/get-hash-list-by-id";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { GET_LOOT_BOX_PAYOUTS_BY_WALLET_ADDRESS } from "@/graphql/queries/get-loot-box-payouts-by-wallet-address";
import { useUser } from "@/hooks/user";
import { Payout } from "@/pages/profile/[id]";
import { formatDateTime } from "@/utils/date-time";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { executeTransaction } from "@/utils/transactions/execute-transaction";
import { useMutation, useQuery } from "@apollo/client";
import { Metaplex } from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const LootBoxDetailPage: NextPage = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { user, loadingUser, setUser } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [lootBox, setLootBox] = useState<LootBox | null>(null);
  const [rewardHashList, setRewardHashList] = useState<string[]>([]);
  const [costHashList, setCostHashList] = useState<string[]>([]);
  const [hashListRewardCollectionId, setHashListRewardCollectionId] = useState<
    string | null
  >(null);
  const [hashListCostCollectionId, setHashListCostCollectionId] = useState<
    string | null
  >(null);
  const [itemRewardCollectionId, setItemRewardCollectionId] = useState<
    string | null
  >(null);
  const [costTokenImageUrl, setCostTokenImageUrl] = useState<string | null>(
    null
  );
  const [costItem, setCostItem] = useState<any | null>(null);
  const [costItemMintAddress, setCostItemMintAddress] = useState<string | null>(
    null
  );
  const [amountOfUserHeldCostTokens, setAmountOfUserHeldCostTokens] =
    useState<number>(0);
  const [hasFetchUserHeldCostTokens, setHasFetchUserHeldCostTokens] =
    useState<boolean>(false);
  const [costAmount, setCostAmount] = useState<number>(0);
  const [nftMintAddressesToBurn, setNftMintAddressesToBurn] = useState<
    string[]
  >([]);
  const [transferInProgress, setTransferInProgress] = useState<boolean>(false);
  const [addBurnAttempt, { data, error }] = useMutation(ADD_BURN_ATTEMPT);
  const [userPayouts, setUserPayouts] = useState<Payout[]>([]);

  const { loading: loadingRewardHashList } = useQuery(GET_HASH_LIST_BY_ID, {
    variables: {
      id: hashListRewardCollectionId,
    },
    skip: !hashListRewardCollectionId,
    onCompleted: ({ sodead_hashLists }) => {
      const { rawHashList } = sodead_hashLists?.[0];
      setRewardHashList(rawHashList);
    },
  });

  const { loading: loadingCostHashList } = useQuery(GET_HASH_LIST_BY_ID, {
    variables: {
      id: hashListCostCollectionId,
    },
    skip: !hashListCostCollectionId,
    onCompleted: ({ sodead_hashLists }) => {
      const { rawHashList } = sodead_hashLists?.[0];
      setCostHashList(rawHashList);
    },
  });

  const { loading: loadingPayouts, refetch: refetchPayouts } = useQuery(
    GET_LOOT_BOX_PAYOUTS_BY_WALLET_ADDRESS,
    {
      variables: {
        lootBoxId: id,
        walletAddress: wallet?.publicKey?.toString(),
      },
      skip: !wallet?.publicKey?.toString() || !id,
      onCompleted: ({ sodead_payouts }) => {
        setUserPayouts(sodead_payouts);
      },
    }
  );

  const { loading: loadingLootBox } = useQuery(GET_LOOT_BOX_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: ({
      sodead_lootBoxes_by_pk,
    }: {
      sodead_lootBoxes_by_pk: LootBox;
    }) => {
      setLootBox(sodead_lootBoxes_by_pk);

      // *** item based rewards and costs ***
      if (
        !sodead_lootBoxes_by_pk?.rewardCollections?.length ||
        !sodead_lootBoxes_by_pk?.costCollections?.length
      )
        return;
      const {
        item: costItem,
        amount: costAmount,
        imageUrl,
      } = sodead_lootBoxes_by_pk?.costCollections?.[0]?.itemCollection;

      setCostItem(costItem);
      setCostItemMintAddress(costItem.token.mintAddress);
      setCostAmount(costAmount);
      setCostTokenImageUrl(imageUrl);
      fetchUserHeldCostTokensViaMintAddress();
      // setAmountOfUserHeldCostTokens(666); // FAKE THIS FOR NOW
      // setHasFetchUserHeldCostTokens(true);

      // *** hashlist based rewards and costs ***
      // const hashListRewardCollectionId =
      //   sodead_lootBoxes_by_pk?.rewardCollections?.[0]?.hashListCollection
      //     ?.hashList?.id;
      // const hashListCostCollectionId =
      //   sodead_lootBoxes_by_pk?.costCollections?.[0]?.hashListCollection
      //     ?.hashList?.id;
      // setHashListRewardCollectionId(hashListRewardCollectionId);
      // setHashListCostCollectionId(hashListCostCollectionId);
      // setCostAmount(
      //   sodead_lootBoxes_by_pk?.costCollections?.[0]?.hashListCollection.amount
      // );
      // setCostTokenImageUrl(
      //   sodead_lootBoxes_by_pk?.costCollections?.[0]?.hashListCollection
      //     ?.imageUrl
      // );
    },
  });

  const handleTransferCostTokens = useCallback(async () => {
    if (
      !wallet?.publicKey ||
      !wallet?.signTransaction ||
      !costItem?.token?.mintAddress
    )
      return;
    const { mintAddress } = costItem.token;
    console.log("cost token", mintAddress);
    setTransferInProgress(true);
    showToast({
      primaryMessage: "Inserting the key...",
    });

    const instructions: TransactionInstructionCtorFields[] = [];

    const fromTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      wallet.publicKey
    );

    // const toTokenAccountAddress = await getAssociatedTokenAddress(
    //   new PublicKey(mintAddress),
    //   new PublicKey(BURNING_WALLET_ADDRESS)
    // );

    // const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
    //   new PublicKey(mintAddress),
    //   new PublicKey(BURNING_WALLET_ADDRESS)
    // );

    // const receiverAccount = await connection.getAccountInfo(
    //   associatedDestinationTokenAddr
    // );

    // if (!receiverAccount) {
    //   instructions.push(
    //     createAssociatedTokenAccountInstruction(
    //       wallet.publicKey,
    //       associatedDestinationTokenAddr,
    //       new PublicKey(BURNING_WALLET_ADDRESS),
    //       new PublicKey(mintAddress)
    //     )
    //   );
    // }

    // instructions.push(
    //   createTransferInstruction(
    //     fromTokenAccountAddress,
    //     toTokenAccountAddress,
    //     wallet.publicKey,
    //     costAmount
    //   )
    // );

    instructions.push(
      createBurnCheckedInstruction(
        fromTokenAccountAddress,
        new PublicKey(mintAddress),
        wallet.publicKey,
        costAmount,
        0
      )
    );

    // only apples to NFTs
    // instructions.push(
    //   createCloseAccountInstruction(
    //     fromTokenAccountAddress,
    //     wallet.publicKey,
    //     wallet.publicKey
    //   )
    // );

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ ...latestBlockhash });
    transaction.add(...instructions);

    let burnTxAddress;
    try {
      burnTxAddress = await executeTransaction(
        connection,
        transaction,
        {},
        wallet
      );
      if (!burnTxAddress) {
        setTransferInProgress(false);
        return;
      }
      showToast({
        primaryMessage: "Opening lootbox...",
        secondaryMessage: "Please do not close this window.",
      });

      const { data } = await axios.post(
        `${BASE_URL}/api/handle-loot-box-claim`,
        {
          lootBoxId: lootBox?.id,
          burnTxAddress,
        }
      );

      setAmountOfUserHeldCostTokens(amountOfUserHeldCostTokens - costAmount);
      setTransferInProgress(false);

      const VAMP_TOKEN_ID = "ea9672fe-0e09-4883-a625-9267d1d1de82";

      showToast({
        primaryMessage: "Success!",
        secondaryMessage:
          VAMP_TOKEN_ID === data?.reward?.item?.token?.id
            ? `You received ${data?.reward.amount / 1000000000} ${
                data?.reward?.item?.name
              }!`
            : `You received ${data?.reward?.item?.name}!`,
      });

      refetchPayouts();

      console.log({
        burnTxAddress,
        lootBoxId: lootBox?.id,
        data,
      });
    } catch (error) {
      console.log(error);
    }
  }, [
    wallet,
    costItem?.token,
    costAmount,
    connection,
    lootBox?.id,
    amountOfUserHeldCostTokens,
    refetchPayouts,
  ]);

  const fetchUserHeldCostTokensViaMintAddress = useCallback(async () => {
    if (
      !wallet?.publicKey ||
      !user ||
      !connection ||
      !costItemMintAddress ||
      hasFetchUserHeldCostTokens
    )
      return;

    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        mintAddresses: [costItemMintAddress],
        walletAddress: wallet.publicKey.toBase58(),
      }
    );

    if (data?.[0]?.amount) {
      setAmountOfUserHeldCostTokens(data[0].amount);
    } else {
      setAmountOfUserHeldCostTokens(0);
    }
    setHasFetchUserHeldCostTokens(true);
  }, [
    wallet.publicKey,
    user,
    connection,
    costItemMintAddress,
    hasFetchUserHeldCostTokens,
  ]);

  const fetchUserHeldCostTokensViaHashList = useCallback(async () => {
    if (
      !wallet?.publicKey ||
      !user ||
      !connection ||
      !costHashList.length ||
      hasFetchUserHeldCostTokens
    )
      return;

    const costTokens = await fetchNftsByHashList({
      hashList: costHashList,
      publicKey: wallet.publicKey,
      connection,
    });
    setAmountOfUserHeldCostTokens(costTokens.length);
    setHasFetchUserHeldCostTokens(true);

    if (costTokens.length >= costAmount) {
      const addresses = costTokens.slice(0, costAmount);
      console.log("addresses", addresses);
      setNftMintAddressesToBurn(addresses.map((token) => token.mintAddress));
      return;
    }
  }, [
    wallet.publicKey,
    user,
    connection,
    costHashList,
    hasFetchUserHeldCostTokens,
    costAmount,
  ]);

  useEffect(() => {
    console.log({
      userHeldCostTokens: amountOfUserHeldCostTokens,
      costAmount,
    });
    if (user && !wallet?.publicKey) {
      setUser(null);
    }
    if (!wallet?.publicKey || !user || !connection) return;

    // *** if cost is items ***
    fetchUserHeldCostTokensViaMintAddress();

    // *** if cost is NFTs ***
    // fetchUserHeldCostTokensViaHashList();
  }, [
    rewardHashList,
    costHashList,
    wallet,
    user,
    connection,
    hashListCostCollectionId,
    hashListRewardCollectionId,
    costAmount,
    amountOfUserHeldCostTokens,
    fetchUserHeldCostTokensViaMintAddress,
    setUser,
  ]);

  if (
    loadingUser ||
    loadingLootBox ||
    loadingRewardHashList ||
    loadingCostHashList
  ) {
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <Spinner />
        </div>
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

  return (
    <ContentWrapper>
      <h1 className="text-5xl font-strange-dreams text-center mb-12 tracking-wider">
        {lootBox?.name}
      </h1>
      <div className="flex items-center justify-center flex-wrap mb-16">
        <div className="flex-col flex w-full justify-center md:w-1/2 items-center mb-16 md:mb-0">
          <ImageWithFallback
            className="rounded-2xl border-2 border-red-500"
            src={lootBox?.imageUrl || ""}
            width={400}
            height={400}
            alt="Lootbox image"
          />
          <div className="italic text-2xl max-w-sm text-center">
            {lootBox?.description}
          </div>
        </div>
        <div className="w-full px-8 md:px-0 md:w-1/2">
          <div className="flex flex-col w-full mx-auto text-xl border-2 border-red-500 rounded-2xl p-6">
            <div className="text-center uppercase text-3xl font-strange-dreams mb-2 tracking-widest">
              Possible Rewards
            </div>
            {!!lootBox && <LootBoxRewards lootBox={lootBox} />}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center mb-8 text-4xl space-x-0 md:space-x-8 font-strange-dreams tracking-widest space-y-6 md:space-y-0">
        <ImageWithFallback
          src={costTokenImageUrl || ""}
          width={100}
          height={100}
          alt="Cost token image"
          className="border-2 border-red-500 rounded-2xl h-28 w-28"
        />
        <div className="flex flex-col space-y-3">
          <div className="flex w-full md:w-auto items-center justify-center space-x-3">
            <div className="uppercase">Cost:</div>
            <div>{costAmount}</div>
          </div>
          <div className="flex w-full md:w-auto items-center justify-center space-x-3">
            <div className="uppercase">You have:</div>
            {hasFetchUserHeldCostTokens ? (
              <div>{amountOfUserHeldCostTokens}</div>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </div>
      <div className="pb-12 pt-4 w-full justify-center flex">
        <SubmitButton
          className="text-2xl tracking-widest font-strange-dreams"
          isSubmitting={transferInProgress}
          onClick={handleTransferCostTokens}
          disabled={!(amountOfUserHeldCostTokens >= costAmount)}
        >
          Claim
        </SubmitButton>
      </div>
      <div className="text-2xl font-strange-dreams tracking-widest text-center mb-4">
        Your Payouts
      </div>
      {!!userPayouts?.length ? (
        <div className="flex flex-col justify-center items-center space-y-2 pb-16">
          {userPayouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-center space-x-12 text-lg"
            >
              <div>{formatDateTime(payout.createdAtWithTimezone)}</div>
              <div className="uppercase">
                {payout.amount == 1 ? "" : payout.amount / 1000000000}{" "}
                {payout.token.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center pb-16">You have no payouts yet</div>
      )}
    </ContentWrapper>
  );
};

export default LootBoxDetailPage;
