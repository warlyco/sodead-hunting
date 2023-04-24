import { RPC_ENDPOINT } from "@/constants/constants";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_ITEM_PAYOUT } from "@/graphql/mutations/add-item-payout";
import { ADD_PAYOUT } from "@/graphql/mutations/add-payout";
import { INVALIDATE_FROM_HUNT } from "@/graphql/mutations/invalidate-from-hunt";
import { REMOVE_FROM_HUNT } from "@/graphql/mutations/remove-from-hunt";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
import { NoopResponse } from "@/pages/api/add-account";
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
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    huntId,
    mainCharacterIds,
    walletAddress,
    shouldInvalidate = false,
    noop,
  } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "remove-from-hunt",
    });

  if (
    !huntId ||
    !mainCharacterIds?.length ||
    !process.env.REWARD_PRIVATE_KEY ||
    !walletAddress
  ) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  if (shouldInvalidate) {
    for (const mainCharacterId of mainCharacterIds) {
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
    return res.status(200).json({
      success: true,
    });
  }

  let rewardTxAddress: string | undefined;

  // send reward
  try {
    const { sodead_activities_by_pk }: { sodead_activities_by_pk: Hunt } =
      await client.request({
        document: GET_HUNT_BY_ID,
        variables: {
          id: huntId,
        },
      });

    const { rewardCollections } = sodead_activities_by_pk;
    const { itemCollection } = rewardCollections?.[0];

    if (!itemCollection) {
      throw new Error("No reward found");
    }

    const { amount, item } = itemCollection;

    if (!item?.token?.mintAddress) {
      throw new Error("No reward found");
    }

    const removalsCount = mainCharacterIds.length;
    const connection = new Connection(RPC_ENDPOINT);

    const rewardKeypair = Keypair.fromSecretKey(
      base58.decode(process.env.REWARD_PRIVATE_KEY)
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
