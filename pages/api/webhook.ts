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
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { Wallet } from "@/pages/me";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { GET_BURN_ATTEMPT_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-burn-attempt-by-token-mint-address";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { ADD_PAYOUT } from "@/graphql/mutations/add-payout";
import { ADD_LOOTBOX_PAYOUT } from "@/graphql/mutations/add-lootbox-payout";

const selectRandomRewardMintAddress = async (
  rawHashList: string[],
  amount: number, // amount of tokens to be burned, needs to be refactored in
  rewardWalletAddress: string,
  connection: Connection
) => {
  const tokensInRewardWallet = await fetchNftsByHashList({
    hashList: rawHashList,
    publicKey: new PublicKey(rewardWalletAddress),
    connection,
  });
  const randomIndex = Math.floor(Math.random() * tokensInRewardWallet.length);
  const randomRewardMintAddress = tokensInRewardWallet[randomIndex].mintAddress;

  return randomRewardMintAddress;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("webhook called");

  if (
    req.method !== "POST" ||
    !process.env.NEXT_PUBLIC_PLATFORM_TOKEN_MINT_ADDRESS
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

    let burnAttempts;

    try {
      const { sodead_burnAttempts }: { sodead_burnAttempts: BurnAttempt[] } =
        await client.request(GET_BURN_ATTEMPT_BY_TOKEN_MINT_ADDRESS, {
          tokenMintAddress: mints?.[0]?.mintAddress,
        });
      burnAttempts = sodead_burnAttempts;
    } catch (error) {
      console.log("sodead_burnAttempts error", error);
      res.status(400).json({ success: false });
      return;
    }

    console.log("sodead_burnAttempts", burnAttempts);

    const { sodead_lootBoxes_by_pk }: { sodead_lootBoxes_by_pk: LootBox } =
      await client.request(GET_LOOT_BOX_BY_ID, {
        id: burnAttempts?.[0]?.lootBox?.id,
      });

    const lootBox = sodead_lootBoxes_by_pk;
    console.log("lootBox", lootBox);

    if (!lootBox?.id) {
      res.status(400).json({ success: false });
      return;
    }

    // hashlist based costs
    // const costs = lootBox?.costCollections?.map((costCollection) => {
    //   return {
    //     rawHashList: costCollection.hashListCollection.hashList.rawHashList,
    //     amount: costCollection.hashListCollection.amount,
    //   };
    // });

    // item based costs
    const costs = lootBox?.costCollections?.map((costCollection) => {
      return {
        item: costCollection.itemCollection.item,
        amount: costCollection.itemCollection.amount,
      };
    });

    const rewards = lootBox?.rewardCollections?.map((rewardCollection) => {
      return {
        item: rewardCollection.itemCollection.item,
        amount: rewardCollection.itemCollection.amount,
        payoutChance: rewardCollection.payoutChance || 1,
      };
    });

    if (!rewards?.length || !costs?.length) {
      res.status(400).json({ success: false });
      return;
    }

    // select random reward based on associated chance
    // const { item, amount: rewardsAmount } = rewards?.[0];
    // random number between 0 and 1
    const randomNumber = Math.random();

    const randomReward = rewards?.find((reward) => {
      return randomNumber <= reward.payoutChance;
    });

    const { item: costItem, amount: paymentAmount } = costs?.[0];

    console.log("paymentAmount", { paymentAmount, costItem });

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
    const currentCount = burnAttempts?.length || 0;
    console.log("currentCount", currentCount);

    if (currentCount < paymentAmount) {
      console.log("updatedBurnCount", currentCount);
      res.status(200).json({
        success: true,
        updatedBurnCount: currentCount,
        lootBoxId: lootBox.id,
      });
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

      // Send reward from random pool
      // const rewardMintAddress = new PublicKey(
      //   selectRandomRewardMintAddress(
      //     JSON.parse(rewardsRawHashList),
      //     rewardsAmount,
      //     rewardPublicKey.toString(),
      //     connection
      //   )
      // );

      if (!randomReward) {
        res.status(400).json({ success: false });
        return;
      }

      const rewardMintAddress = new PublicKey(
        randomReward.item.token.mintAddress
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

      console.log("webhook 8", toTokenAccountAddress);

      const receiverAccount = await connection.getAccountInfo(
        toTokenAccountAddress
      );

      console.log("webhook 9", receiverAccount);

      const latestBlockhash2 = await connection.getLatestBlockhash();
      const rewardTransaction = new Transaction({ ...latestBlockhash2 });

      const rewardInstructions: TransactionInstructionCtorFields[] = [];

      if (!receiverAccount) {
        rewardInstructions.push(
          createAssociatedTokenAccountInstruction(
            rewardPublicKey,
            toTokenAccountAddress,
            new PublicKey(fromUserAccount),
            rewardMintAddress
          )
        );

        console.log("webhook 10", {
          rewardPublicKey,
          toTokenAccountAddress,
          fromUserAccount,
        });
      }

      rewardInstructions.push(
        createTransferInstruction(
          fromTokenAccountAddress,
          toTokenAccountAddress,
          rewardPublicKey,
          // has 9 decimals
          randomReward.amount * 1000000000
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

      const { insert_sodead_payouts_one }: { insert_sodead_payouts_one: any } =
        await client.request({
          document: ADD_LOOTBOX_PAYOUT,
          variables: {
            txAddress: rewardTxAddress,
            // has 9 decimals
            amount: randomReward.amount * 1000000000,
            tokenId: randomReward.item.token.id,
            createdAtWithTimezone: new Date().toISOString(),
            walletId,
            lootBoxId: lootBox.id,
          },
        });

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
