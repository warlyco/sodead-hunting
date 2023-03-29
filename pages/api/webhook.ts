import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/constants/constants";
import * as base58 from "bs58";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export type BurnCount = {
  id: string;
  currentCount: number;
};

export type BurnAttempt = {
  id: string;
  txAddress: string;
  walletAddress: string;
  mintIds: string[];
  hashList: {
    id: string;
  };
  lootBox: {
    id: string;
  };
};

type Data = {
  success: boolean;
  burnTxAddress?: string;
  rewardTxAddress?: string;
  updatedBurnCount?: number;
  lootBoxId?: string;
};

import { client } from "@/graphql/backend-client";
import { INCREMENT_BURN_COUNT } from "@/graphql/mutations/increment-burn-count";
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { GET_BURN_COUNT } from "@/graphql/queries/get-burn-count";
import { Wallet } from "@/pages/me";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { GET_BURN_ATTEMPT_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-burn-attempt-by-token-mint-address";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("webhook called");

  if (
    req.method !== "POST" ||
    !process.env.NEXT_PUBLIC_PLATFORM_TOKEN_MINT_ADDRESS ||
    !process.env.NEXT_PUBLIC_REWARD_TOKEN_MINT_ADDRESS
  ) {
    res.status(405).json({ success: false });
    return;
  }

  console.log("webhook 1");
  const { body } = req;

  console.log("webhook 2", body);

  if (
    !body ||
    !process.env.FURNACE_PRIVATE_KEY ||
    !process.env.REWARD_PRIVATE_KEY
  ) {
    res.status(400).json({ success: false });
    return;
  }
  const connection = new Connection(RPC_ENDPOINT);
  const fireKeypair = Keypair.fromSecretKey(
    base58.decode(process.env.FURNACE_PRIVATE_KEY)
  );
  const rewardKeypair = Keypair.fromSecretKey(
    base58.decode(process.env.REWARD_PRIVATE_KEY)
  );
  const firePublicKey = new PublicKey(fireKeypair.publicKey.toString());
  const rewardPublicKey = new PublicKey(rewardKeypair.publicKey.toString());
  let burnTxAddress;
  let rewardTxAddress;

  if (
    body[0]?.type === "TRANSFER" &&
    body[0]?.tokenTransfers[0].toUserAccount === firePublicKey.toString()
  ) {
    // handle burn and reward
    const { tokenTransfers, signature } = body[0];
    const mints = tokenTransfers.map(
      (transfer: { mint: string; toTokenAccount: string }) => ({
        mintAddress: transfer.mint,
        tokenAccountAddress: transfer.toTokenAccount,
      })
    );

    if (!mints.length) {
      res.status(400).json({ success: false });
      return;
    }
    console.log("mints", mints);
    console.log("mints[0].mintAddress", mints[0].mintAddress);

    const { sodead_burnAttempts }: { sodead_burnAttempts: BurnAttempt[] } =
      await client.request(GET_BURN_ATTEMPT_BY_TOKEN_MINT_ADDRESS, {
        tokenMintAddress: mints?.[0]?.mintAddress,
      });

    console.log("sodead_burnAttempts", sodead_burnAttempts);

    const { sodead_lootBoxes_by_pk }: { sodead_lootBoxes_by_pk: LootBox } =
      await client.request(GET_LOOT_BOX_BY_ID, {
        id: sodead_burnAttempts?.[0]?.lootBox?.id,
      });

    const lootBox = sodead_lootBoxes_by_pk;
    console.log("lootBox", lootBox);

    if (!lootBox?.id) {
      res.status(400).json({ success: false });
      return;
    }

    const costs = lootBox?.costCollections?.map((costCollection) => {
      return {
        rawHashList: costCollection.hashListCollection.hashList.rawHashList,
        amount: costCollection.hashListCollection.amount,
      };
    });

    const paymentAmount = costs?.[0]?.amount;

    console.log("paymentAmount", paymentAmount);

    // add burn count per user to db
    const { fromUserAccount } = tokenTransfers[0];

    const { sodead_wallets }: { sodead_wallets: Wallet[] } =
      await client.request(GET_WALLET_BY_ADDRESS, { address: fromUserAccount });

    const walletId = sodead_wallets?.[0]?.id;
    console.log("walletId", walletId);

    if (!walletId || !paymentAmount) {
      res.status(400).json({ success: false });
      return;
    }
    const currentCount = sodead_burnAttempts?.length || 0;

    let updatedBurnCount = 0;

    if (currentCount + 1 < paymentAmount) {
      const {
        update_sodead_burnCounts,
      }: { update_sodead_burnCounts: BurnCount[] } = await client.request(
        INCREMENT_BURN_COUNT,
        {
          walletId,
          lootBoxId: lootBox.id,
          tokenMintAddress: mints?.[0]?.mintAddress,
          txAddress: signature,
          currentCount: currentCount + 1,
        }
      );
      updatedBurnCount = update_sodead_burnCounts?.[0]?.currentCount || 0;
      console.log("updatedBurnCount", updatedBurnCount);
      res
        .status(400)
        .json({ success: true, updatedBurnCount, lootBoxId: lootBox.id });
      return;
    }

    if (!updatedBurnCount) {
      res.status(400).json({ success: false });
      return;
    }

    try {
      console.log("burn will happen here");
      // const latestBlockhash = await connection.getLatestBlockhash();
      // const burnTransaction = new Transaction({ ...latestBlockhash });
      // const burnInstructions: TransactionInstructionCtorFields[] = [];

      // for (const mint of mints) {
      //   burnInstructions.push(
      //     createBurnCheckedInstruction(
      //       new PublicKey(mint.tokenAccountAddress),
      //       new PublicKey(mint.mintAddress),
      //       firePublicKey,
      //       1,
      //       0
      //     )
      //   );

      //   burnInstructions.push(
      //     createCloseAccountInstruction(
      //       new PublicKey(mint.tokenAccountAddress),
      //       new PublicKey(COLLECTION_WALLET_ADDRESS),
      //       firePublicKey
      //     )
      //   );
      // }

      // console.log(2);

      // burnTransaction.add(...burnInstructions);

      // console.log(3);

      // burnTransaction.feePayer = firePublicKey;
      // console.log(4);

      // burnTxAddress = await sendAndConfirmTransaction(
      //   connection,
      //   burnTransaction,
      //   [fireKeypair],
      //   {
      //     commitment: "confirmed",
      //     maxRetries: 2,
      //   }
      // );

      // console.log("burned", { burnTxAddress });

      // Send reward
      const rewardMintAddress = new PublicKey(
        process.env.NEXT_PUBLIC_REWARD_TOKEN_MINT_ADDRESS
      );

      console.log("webhook 4", rewardMintAddress);

      const fromTokenAccountAddress = await getAssociatedTokenAddress(
        rewardMintAddress,
        rewardPublicKey
      );

      console.log("webhook 6", fromTokenAccountAddress);

      const toTokenAccountAddress = await getAssociatedTokenAddress(
        rewardMintAddress,
        new PublicKey(fromUserAccount)
      );

      console.log("webhook 7", toTokenAccountAddress);

      const associatedDestinationTokenAddress = await getAssociatedTokenAddress(
        rewardMintAddress,
        new PublicKey(fromUserAccount)
      );

      console.log("webhook 8", associatedDestinationTokenAddress);

      const receiverAccount = await connection.getAccountInfo(
        associatedDestinationTokenAddress
      );

      console.log("webhook 9", receiverAccount);

      const latestBlockhash2 = await connection.getLatestBlockhash();
      const rewardTransaction = new Transaction({ ...latestBlockhash2 });

      const rewardInstructions: TransactionInstructionCtorFields[] = [];

      if (!receiverAccount) {
        rewardInstructions.push(
          createAssociatedTokenAccountInstruction(
            rewardPublicKey,
            associatedDestinationTokenAddress,
            new PublicKey(fromUserAccount),
            rewardMintAddress
          )
        );

        console.log("webhook 10", {
          rewardPublicKey,
          associatedDestinationTokenAddress,
          fromUserAccount,
        });
      }

      rewardInstructions.push(
        createTransferInstruction(
          fromTokenAccountAddress,
          toTokenAccountAddress,
          rewardPublicKey,
          1
        )
      );

      console.log("webhook 12", rewardInstructions);

      // Send platform reward
      // const platformTokenMintAddress = new PublicKey(
      //   process.env.NEXT_PUBLIC_PLATFORM_TOKEN_MINT_ADDRESS
      // );

      // const fromPlatformTokenAccountAddress = await getAssociatedTokenAddress(
      //   platformTokenMintAddress,
      //   rewardPublicKey
      // );

      // const toPlatformTokenAccountAddress = await getAssociatedTokenAddress(
      //   platformTokenMintAddress,
      //   new PublicKey(fromUserAccount)
      // );

      // const associatedDestinationPlatformTokenAddress =
      //   await getAssociatedTokenAddress(
      //     platformTokenMintAddress,
      //     new PublicKey(fromUserAccount)
      //   );

      // const receiverPlatformTokenAccount = await connection.getAccountInfo(
      //   associatedDestinationPlatformTokenAddress
      // );

      // if (!receiverPlatformTokenAccount) {
      //   rewardInstructions.push(
      //     createAssociatedTokenAccountInstruction(
      //       rewardPublicKey,
      //       associatedDestinationPlatformTokenAddress,
      //       new PublicKey(fromUserAccount),
      //       platformTokenMintAddress
      //     )
      //   );

      //   console.log("webhook 18", {
      //     rewardPublicKey,
      //     associatedDestinationPlatformTokenAddress,
      //     fromUserAccount,
      //   });
      // }

      // rewardInstructions.push(
      //   createTransferInstruction(
      //     fromPlatformTokenAccountAddress,
      //     toPlatformTokenAccountAddress,
      //     rewardPublicKey,
      //     1
      //   )
      // );

      console.log("webhook 19", rewardInstructions);

      rewardTransaction.add(...rewardInstructions);

      console.log("webhook 20");

      rewardTxAddress = await sendAndConfirmTransaction(
        connection,
        rewardTransaction,
        [rewardKeypair],
        {
          commitment: "confirmed",
          maxRetries: 2,
        }
      );

      console.log("rewarded", { rewardTxAddress });

      // const payload = {
      //   burnTxAddress,
      //   rewardTxAddress,
      //   userPublicKey: fromUserAccount,
      //   mintIds: mints.map((mint: { mintAddress: string }) => mint.mintAddress),
      //   burnRewardId: "8dca45c9-6d55-4cd6-8103-b24e25c8d335", // LUPERS Free mint
      //   projectId: "d9423b5d-5a2b-418e-838e-1d65c9aabf57", // Narentines
      //   transferTxAddress: signature,
      // };

      // const res = await axios.post(`${BASE_URL}/api/add-burn`, payload);

      // console.log(`posted to ${BASE_URL}/api/add-burn`, res);
    } catch (error) {
      console.log("error in webhook burning and sending reward", { error });
    }
  }

  res.status(200).json({ success: true, burnTxAddress, rewardTxAddress });
}
