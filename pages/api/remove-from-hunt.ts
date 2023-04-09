// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { RPC_ENDPOINT } from "@/constants/constants";
import { Hunt } from "@/features/admin/hunts/hunts-list-item";
import { client } from "@/graphql/backend-client";
import { REMOVE_FROM_HUNT } from "@/graphql/mutations/remove-from-hunt";
import { GET_HUNT_BY_ID } from "@/graphql/queries/get-hunt-by-id";
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

type Data =
  | Hunt[]
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { huntId, mainCharacterIds, walletAddress } = req.body;

  if (
    !huntId ||
    !mainCharacterIds ||
    !process.env.REWARD_PRIVATE_KEY ||
    !walletAddress
  ) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  let removalsCount = 0;
  let rewardTxAddress: string | undefined;

  try {
    for (const mainCharacterId of mainCharacterIds) {
      const {
        update_sodead_activityInstances,
      }: { update_sodead_activityInstances: any } = await client.request({
        document: REMOVE_FROM_HUNT,
        variables: {
          activityId: huntId,
          mainCharacterId,
        },
      });
      removalsCount += 1;
    }

    console.log("amount of removals", removalsCount);
  } catch (error) {
    res.status(500).json({ error });
  }

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

    console.log({
      amount,
      item,
      removalsCount,
    });

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

    console.log("rewardTxAddress", rewardTxAddress);

    res.status(200).json([sodead_activities_by_pk]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
