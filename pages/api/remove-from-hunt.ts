import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import collectionHashList from "@/features/hashlist/sodead-full-collection.json";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_ITEM_PAYOUT } from "@/graphql/mutations/add-item-payout";
import { ADD_PAYOUT } from "@/graphql/mutations/add-payout";
import { INVALIDATE_FROM_HUNT } from "@/graphql/mutations/invalidate-from-hunt";
import { REMOVE_FROM_HUNT } from "@/graphql/mutations/remove-from-hunt";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
import { NoopResponse } from "@/pages/api/add-account";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { PublicKey } from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstructionCtorFields,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getCreaturesInActivity,
  getCreaturesListedWhileInActivity,
  getCreaturesSoldWhileInActivity,
  getCreaturesWithActivityInstances,
} from "@/utils/creatures";
import { GET_CREATURES_BY_TOKEN_MINT_ADDRESSES } from "@/graphql/queries/get-creatures-by-token-mint-addresses";
import { Creature } from "@/features/creatures/creature-list";
import axios from "axios";
import dayjs from "dayjs";
import { NftEventFromHelius } from "@/pages/api/get-nft-listings-and-sales-by-wallet-address";
import { UPDATE_USER } from "@/graphql/mutations/update-user";
import { User } from "@/features/admin/users/users-list-item";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";

export type RemoveFromHuntResponse = {
  rewardTxAddress: string;
  reward: {
    amount: number;
    mintAddress: string;
    item: {
      name: string;
      imageUrl: string;
    };
  };
};

type InvalidationResponse = {
  success: boolean;
};

type Data =
  | RemoveFromHuntResponse
  | InvalidationResponse
  | NoopResponse
  | any
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { huntId, walletAddress, shouldInvalidate = false, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "remove-from-hunt",
    });

  if (!huntId || !process.env.REWARD_PRIVATE_KEY || !walletAddress) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  // get characters by holder in hunt
  const { sodead_activities_by_pk: hunt }: { sodead_activities_by_pk: Hunt } =
    await client.request({
      document: GET_HUNT_BY_ID,
      variables: {
        id: huntId,
      },
    });

  const connection = new Connection(RPC_ENDPOINT);

  const nftsWithoutDetails = await fetchNftsByHashList({
    publicKey: new PublicKey(walletAddress),
    hashList: collectionHashList,
    connection,
    withDetails: false,
  });

  const mintAddresses = [
    ...nftsWithoutDetails.map(({ mintAddress }) => mintAddress),
  ];

  const { sodead_creatures: creatures }: { sodead_creatures: Creature[] } =
    await client.request({
      document: GET_CREATURES_BY_TOKEN_MINT_ADDRESSES,
      variables: {
        mintAddresses,
      },
    });

  let creaturesInActivity = getCreaturesInActivity(creatures, hunt);

  const creaturesWithCompleteActivityInstances =
    getCreaturesWithActivityInstances(creaturesInActivity, huntId, true);

  let mainCharacterIds: String[] = creaturesWithCompleteActivityInstances.map(
    ({ id }) => id
  );

  const earliestStartTime = creaturesWithCompleteActivityInstances
    .map(({ activityInstance }) => activityInstance?.startTime)
    .sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    })?.[0];

  const { data } = await axios.post(
    `${BASE_URL}/api/get-nft-listings-and-sales-by-wallet-address`,
    {
      walletAddress,
      startTime: dayjs(earliestStartTime).unix(),
    }
  );

  const {
    listings,
    cancelledListings,
    sales,
  }: {
    listings: NftEventFromHelius[];
    sales: NftEventFromHelius[];
    cancelledListings: NftEventFromHelius[];
  } = data;

  let creaturesToInvalidate: Creature[] = [];

  if (listings.length || sales.length) {
    const creaturesListedWhileInActivity = getCreaturesListedWhileInActivity(
      listings,
      cancelledListings,
      creatures,
      hunt
    );

    const creaturesSoldWhileInActivity = getCreaturesSoldWhileInActivity(
      sales,
      creatures,
      hunt,
      walletAddress
    );

    if (
      creaturesListedWhileInActivity.length ||
      creaturesSoldWhileInActivity.length
    ) {
      creaturesToInvalidate = [
        ...creaturesListedWhileInActivity,
        ...creaturesSoldWhileInActivity,
      ];

      const idsToInvalidate = creaturesToInvalidate.map(({ id }) => id);

      // remove from activity
      creaturesInActivity = creaturesInActivity.filter((creature) => {
        return !creaturesToInvalidate.find(({ id }) => id === creature.id);
      });

      mainCharacterIds = creaturesInActivity.map(({ id }) => id);

      for (const mainCharacterId of idsToInvalidate) {
        const {
          update_sodead_activityInstances,
        }: { update_sodead_activityInstances: any } = await client.request({
          document: INVALIDATE_FROM_HUNT,
          variables: {
            activityId: huntId,
            mainCharacterId,
          },
        });
      }
    }
  }

  let rewardTxAddress: string | undefined;

  // send reward
  try {
    const { rewardCollections } = hunt;
    const { itemCollection } = rewardCollections?.[0];

    if (!itemCollection) {
      throw new Error("No reward found");
    }

    const { amount, item } = itemCollection;

    if (!item?.token?.mintAddress) {
      throw new Error("No reward found");
    }

    // get user by wallet address
    const { sodead_users: users }: { sodead_users: User[] } =
      await client.request({
        document: GET_USER_BY_WALLET_ADDRESS,
        variables: {
          address: walletAddress,
        },
      });

    const user = users?.[0];

    if (!user) {
      throw new Error("No user found");
    }

    // check if claimingTimeStamp is set and less than 2 min ago
    if (user.claimingTimeStampHunt) {
      const claimingTimeStamp = new Date(user.claimingTimeStampHunt).getTime();
      const twoMinutesAgo = new Date().getTime() - 2 * 60 * 1000;

      const claimingTimeStampUnderTwoMinutesAgo =
        claimingTimeStamp > twoMinutesAgo;

      if (claimingTimeStampUnderTwoMinutesAgo) {
        throw new Error("Claiming timestamp is under two minutes ago");
      }
    }

    // save claimingTimeStamp to disallow double claims
    const { update_sodead_users }: { update_sodead_users: User[] } =
      await client.request({
        document: UPDATE_USER,
        variables: {
          id: user.id,
          setInput: {
            claimingTimeStampHunt: new Date().toISOString(),
          },
        },
      });

    const removalsCount = mainCharacterIds.length;

    const rewardKeypair = Keypair.fromSecretKey(
      base58.decode(process.env.REWARD_PRIVATE_KEY!)
    );
    const rewardPublicKey = new PublicKey(rewardKeypair.publicKey.toString());

    const rewardAmount = amount * removalsCount;

    const rewardMintAddress = new PublicKey(item.token.mintAddress);

    const fromTokenAccountAddress = await getAssociatedTokenAddress(
      rewardMintAddress,
      rewardPublicKey
    );

    const toTokenAccountAddress = await getAssociatedTokenAddress(
      rewardMintAddress,
      new PublicKey(walletAddress)
    );

    const associatedDestinationTokenAddress = await getAssociatedTokenAddress(
      rewardMintAddress,
      new PublicKey(walletAddress)
    );

    const receiverAccount = await connection.getAccountInfo(
      associatedDestinationTokenAddress
    );

    const latestBlockhash2 = await connection.getLatestBlockhash();
    const rewardTransaction = new Transaction({ ...latestBlockhash2 });

    const rewardInstructions: TransactionInstructionCtorFields[] = [];

    if (!receiverAccount) {
      rewardInstructions.push(
        createAssociatedTokenAccountInstruction(
          rewardPublicKey,
          associatedDestinationTokenAddress,
          new PublicKey(walletAddress),
          rewardMintAddress
        )
      );
    }

    rewardInstructions.push(
      createTransferInstruction(
        fromTokenAccountAddress,
        toTokenAccountAddress,
        rewardPublicKey,
        rewardAmount
      )
    );

    rewardTransaction.add(...rewardInstructions);

    rewardTxAddress = await sendAndConfirmTransaction(
      connection,
      rewardTransaction,
      [rewardKeypair],
      {
        commitment: "confirmed",
        maxRetries: 2,
      }
    );

    let document;
    if (item.id) {
      console.log("item payout");
      document = ADD_ITEM_PAYOUT;
    } else {
      console.log("non-item payout");
      document = ADD_PAYOUT;
    }

    let variables: any = {
      txAddress: rewardTxAddress,
      amount: rewardAmount,
      tokenId: item.token.id,
      createdAtWithTimezone: new Date().toISOString(),
    };

    if (item.id) {
      variables = {
        ...variables,
        itemId: item.id,
      };
    }

    console.log({ variables });

    const { insert_sodead_payouts_one }: { insert_sodead_payouts_one: any } =
      await client.request({
        document,
        variables,
      });

    try {
      for (const mainCharacterId of mainCharacterIds) {
        console.log({
          activityId: huntId,
          mainCharacterId,
          payoutId: insert_sodead_payouts_one.id,
        });

        const {
          update_sodead_activityInstances,
        }: { update_sodead_activityInstances: any } = await client.request({
          document: REMOVE_FROM_HUNT,
          variables: {
            activityId: huntId,
            mainCharacterId,
            payoutId: insert_sodead_payouts_one.id,
          },
        });
      }

      console.log("amount of removals", mainCharacterIds.length);
    } catch (error) {
      res.status(500).json({ error });
    }

    console.log("rewardTxAddress", rewardTxAddress, insert_sodead_payouts_one);

    res.status(200).json({
      rewardTxAddress: rewardTxAddress,
      reward: {
        amount: rewardAmount,
        mintAddress: item.token.mintAddress,
        item: {
          name: item.name,
          imageUrl: item.imageUrl,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
