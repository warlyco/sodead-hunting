import { BURNING_WALLET_ADDRESS } from "@/constants/constants";
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
import { GET_ITEM_BY_ID } from "@/graphql/queries/get-item-by-id";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { useUser } from "@/hooks/user";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { executeTransaction } from "@/utils/transactions/execute-transaction";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const LootBoxDetailPage: NextPage = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { user, loadingUser } = useUser();
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
        !sodead_lootBoxes_by_pk?.rewardCollections?.[0]?.itemCollection?.item ||
        !sodead_lootBoxes_by_pk?.costCollections?.[0]?.itemCollection?.item
      )
        return;
      const {
        item: costItem,
        amount: costAmount,
        imageUrl,
      } = sodead_lootBoxes_by_pk?.costCollections?.[0]?.itemCollection;
      setCostItem(costItem);
      setCostAmount(costAmount);
      setCostTokenImageUrl(imageUrl);
      setAmountOfUserHeldCostTokens(1); // FAKE THIS FOR NOW
      setHasFetchUserHeldCostTokens(true);

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

  const handleTransferNfts = useCallback(async () => {
    console.log("handleTransferNfts", nftMintAddressesToBurn);

    if (!wallet?.publicKey || !wallet?.signTransaction) return;
    setTransferInProgress(true);
    showToast({
      primaryMessage: "Sending NFTs to the furnace",
    });

    const instructions: TransactionInstructionCtorFields[] = [];

    const fromTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(nftMintAddressesToBurn[0]),
      wallet.publicKey
    );

    const toTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(nftMintAddressesToBurn[0]),
      new PublicKey(BURNING_WALLET_ADDRESS)
    );

    const associatedDestinationTokenAddr = await getAssociatedTokenAddress(
      new PublicKey(nftMintAddressesToBurn[0]),
      new PublicKey(BURNING_WALLET_ADDRESS)
    );

    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddr
    );

    if (!receiverAccount) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedDestinationTokenAddr,
          new PublicKey(BURNING_WALLET_ADDRESS),
          new PublicKey(nftMintAddressesToBurn[0])
        )
      );
    }

    instructions.push(
      createTransferInstruction(
        fromTokenAccountAddress,
        toTokenAccountAddress,
        wallet.publicKey,
        1
      )
    );

    instructions.push(
      createCloseAccountInstruction(
        fromTokenAccountAddress,
        wallet.publicKey,
        wallet.publicKey
      )
    );

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ ...latestBlockhash });
    transaction.add(...instructions);

    executeTransaction(
      connection,
      transaction,
      {
        callback: () => setTransferInProgress(false),
        successCallback: () => {
          showToast({
            primaryMessage: "Success, your claim will be in your wallet soon",
          });
          setNftMintAddressesToBurn([]);
          setAmountOfUserHeldCostTokens(
            amountOfUserHeldCostTokens - costAmount
          );
        },
      },
      wallet,
      addBurnAttempt,
      nftMintAddressesToBurn,
      hashListRewardCollectionId,
      lootBox?.id
    );
  }, [
    nftMintAddressesToBurn,
    wallet,
    connection,
    addBurnAttempt,
    hashListRewardCollectionId,
    costAmount,
    amountOfUserHeldCostTokens,
    lootBox?.id,
  ]);

  // const fetchUserHeldCostTokensViaMintAddress = useCallback(async () => {
  //   if (!wallet?.publicKey || !user || !connection || !!costItem?.id) return;

  // }, [wallet?.publicKey, user, connection, costItem?.id]);

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
    if (
      !wallet?.publicKey ||
      !user ||
      !connection ||
      !hashListCostCollectionId ||
      !hashListRewardCollectionId ||
      !costHashList.length
    )
      return;

    // *** if cost is items ***
    // fetchUserHeldCostTokensViaItemId();

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
      <div className="flex items-center flex-wrap">
        <div className="flex-col flex w-full justify-center md:w-1/2 items-center mb-16 md:mb-0">
          <ImageWithFallback
            className="rounded-2xl mb-12 border-2 border-red-500"
            src={lootBox?.imageUrl || ""}
            width={350}
            height={350}
            alt="Lootbox image"
          />
          <div className="italic text-2xl max-w-sm text-center">
            {lootBox?.description}
          </div>
        </div>
        <div className="flex-col md:flex-row flex w-full justify-center md:w-1/2 items-center font-strange-dreams tracking-widest">
          <div className="flex items-center mb-8 text-3xl space-y-6 flex-col">
            <ImageWithFallback
              src={costTokenImageUrl || ""}
              width={200}
              height={200}
              alt="Cost token image"
              className="border-2 border-red-500 rounded-2xl h-48 w-48 mb-6"
            />
            <div className="flex items-center space-x-3">
              <div className="uppercase">Cost:</div>
              <div>{costAmount}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="uppercase">You have:</div>
              {hasFetchUserHeldCostTokens ? (
                <div>{amountOfUserHeldCostTokens}</div>
              ) : (
                <Spinner />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full max-w-lg mx-auto text-xl border-2 border-red-500 rounded-2xl p-6 mb-8">
        <div className="text-center uppercase text-3xl font-strange-dreams mb-2 tracking-widest">
          Possible Rewards
        </div>
        {!!lootBox && <LootBoxRewards lootBox={lootBox} />}
      </div>
      <div className="pb-12 pt-4 w-full justify-center flex">
        <SubmitButton
          className="text-2xl tracking-widest font-strange-dreams"
          isSubmitting={transferInProgress}
          onClick={handleTransferNfts}
          disabled={!(amountOfUserHeldCostTokens >= costAmount)}
        >
          Claim
        </SubmitButton>
      </div>
    </ContentWrapper>
  );
};

export default LootBoxDetailPage;
