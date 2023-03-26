import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import {
  BASE_URL,
  COLLECTION_WALLET_ADDRESS,
  PLATFORM_TOKEN_MINT_ADDRESS,
  RPC_ENDPOINT,
} from "@/constants/constants";
import * as base58 from "bs58";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  createAssociatedTokenAccountInstruction,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

type Data = {
  success: boolean;
  burnTxAddress?: string;
  rewardTxAddress?: string;
};

import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("webhook called");

  if (
    req.method !== "POST" ||
    !process.env.NEXT_PUBLIC_REWARD_TOKEN_MINT_ADDRESS
  ) {
    res.status(405).json({ success: false });
    return;
  }

  console.log("webhook 1");
  const { body } = req;

  console.log("webhook 2", body);

  if (!body || !process.env.FURNACE_KEY || !process.env.REWARD_PRIVATE_KEY) {
    res.status(400).json({ success: false });
    return;
  }

  const connection = new Connection(RPC_ENDPOINT);
  const fireKeypair = Keypair.fromSecretKey(
    base58.decode(process.env.FURNACE_KEY)
  );
  const rewardKeypair = Keypair.fromSecretKey(
    base58.decode(process.env.REWARD_PRIVATE_KEY)
  );
  const firePublicKey = new PublicKey(fireKeypair.publicKey.toString());
  const rewardPublicKey = new PublicKey(rewardKeypair.publicKey.toString());
  let burnTxAddress;
  let rewardTxAddress;

  console.log("webhook 3");

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
    console.log("burning mints and closing ATAs:", { mints });

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

      const toTokenAccountAddress = await getAssociatedTokenAddress(
        rewardMintAddress,
        new PublicKey(tokenTransfers[0]?.fromUserAccount)
      );

      const associatedDestinationTokenAddress = await getAssociatedTokenAddress(
        rewardMintAddress,
        new PublicKey(tokenTransfers[0]?.fromUserAccount)
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
            new PublicKey(tokenTransfers[0]?.fromUserAccount),
            rewardMintAddress
          )
        );
      }

      rewardInstructions.push(
        createTransferInstruction(
          fromTokenAccountAddress,
          toTokenAccountAddress,
          rewardPublicKey,
          1
        )
      );

      // Send platform reward
      const platformTokenMintAddress = new PublicKey(
        PLATFORM_TOKEN_MINT_ADDRESS
      );

      const fromPlatformTokenAccountAddress = await getAssociatedTokenAddress(
        platformTokenMintAddress,
        rewardPublicKey
      );

      const toPlatformTokenAccountAddress = await getAssociatedTokenAddress(
        platformTokenMintAddress,
        new PublicKey(tokenTransfers[0]?.fromUserAccount)
      );

      const associatedDestinationPlatformTokenAddress =
        await getAssociatedTokenAddress(
          platformTokenMintAddress,
          new PublicKey(tokenTransfers[0]?.fromUserAccount)
        );

      const receiverPlatformTokenAccount = await connection.getAccountInfo(
        associatedDestinationPlatformTokenAddress
      );

      if (!receiverPlatformTokenAccount) {
        rewardInstructions.push(
          createAssociatedTokenAccountInstruction(
            rewardPublicKey,
            associatedDestinationPlatformTokenAddress,
            new PublicKey(tokenTransfers[0]?.fromUserAccount),
            platformTokenMintAddress
          )
        );
      }

      rewardInstructions.push(
        createTransferInstruction(
          fromPlatformTokenAccountAddress,
          toPlatformTokenAccountAddress,
          rewardPublicKey,
          1
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

      const payload = {
        burnTxAddress,
        rewardTxAddress,
        userPublicKey: tokenTransfers[0]?.fromUserAccount,
        mintIds: mints.map((mint: { mintAddress: string }) => mint.mintAddress),
        burnRewardId: "8dca45c9-6d55-4cd6-8103-b24e25c8d335", // LUPERS Free mint
        projectId: "d9423b5d-5a2b-418e-838e-1d65c9aabf57", // Narentines
        transferTxAddress: signature,
      };

      console.log("rewarded", { rewardTxAddress });

      const res = await axios.post(`${BASE_URL}/api/add-burn`, payload);

      console.log(`posted to ${BASE_URL}/api/add-burn`, res);
    } catch (error) {
      console.log("error in webhook burning and sending reward", { error });
    }
  }

  res.status(200).json({ success: true, burnTxAddress, rewardTxAddress });
}
