// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import { LootBox } from "@/features/admin/loot-boxes/loot-box-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_CLAIM } from "@/graphql/mutations/add-claim";
import { ADD_PAYOUT } from "@/graphql/mutations/add-payout";
import { GET_LOOT_BOX_BY_ID } from "@/graphql/queries/get-loot-box-by-id";
import { Payout } from "@/pages/profile/[id]";
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
import type { NextApiRequest, NextApiResponse } from "next";
import * as base58 from "bs58";
import axios from "axios";
import { EnhancedTransactionFromHelius } from "@/pages/api/get-tx-info-from-helius";
import { sleep } from "@/utils/data-flow";

const fetchInfoFromHelius = async (burnTxAddress: string) => {
  return axios.post(
    `https://api.helius.xyz/v0/transactions?api-key=${process.env.HELIUS_API_KEY}`,
    {
      transactions: [burnTxAddress],
    }
  );
};

type Data =
  | Payout
  | any
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { burnTxAddress, lootBoxId } = req.body;

  if (!burnTxAddress || !lootBoxId || !process.env.REWARD_PRIVATE_KEY) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  await sleep(5000);

  let burnTxInfo: EnhancedTransactionFromHelius;
  const { data }: { data: EnhancedTransactionFromHelius[] } =
    await fetchInfoFromHelius(burnTxAddress);
  console.log("~~data", data);
  let counter = 0;
  burnTxInfo = data?.[0];

  if (!burnTxInfo?.slot) {
    return res.status(500).json({ error: "No instructions found" });
  }

  console.log("tx data", burnTxInfo);

  const connection = new Connection(RPC_ENDPOINT);
  const rewardKeypair = Keypair.fromSecretKey(
    base58.decode(process.env.REWARD_PRIVATE_KEY)
  );
  const rewardPublicKey = new PublicKey(rewardKeypair.publicKey.toString());

  const { sodead_lootBoxes_by_pk }: { sodead_lootBoxes_by_pk: LootBox } =
    await client.request(GET_LOOT_BOX_BY_ID, {
      id: lootBoxId,
    });

  const lootBox = sodead_lootBoxes_by_pk;
  console.log("lootBox", lootBox);

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
    res.status(400).json({ error: "No rewards or costs" });
    return;
  }

  const randomNumber = Math.random();

  const randomReward = rewards?.find((reward) => {
    return randomNumber <= reward.payoutChance;
  });

  if (!randomReward) {
    res.status(400).json({ error: "No reward found" });
    return;
  }

  let rewardAmount = randomReward.amount;

  if (
    randomReward.item.token.mintAddress ===
    "5tdfToRGBGRqbPaBq8TAtDncgy7ejM26TwRfcmVaNpqy" // $VAMP
  ) {
    rewardAmount = randomReward.amount * 1000000000;
  }

  let rewardTxAddress: string;
  const rewardMintAddress = new PublicKey(randomReward.item.token.mintAddress);
  const fromUserAccount = new PublicKey(burnTxInfo?.feePayer);

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

  try {
    const { insert_sodead_payouts_one }: { insert_sodead_payouts_one: Payout } =
      await client.request({
        document: ADD_PAYOUT,
        variables: {
          txAddress: rewardTxAddress,
          amount: rewardAmount,
          tokenId: randomReward.item.token.id,
          createdAtWithTimezone: new Date().toISOString(),
        },
      });

    res.status(200).json(insert_sodead_payouts_one);
  } catch (error) {
    res.status(500).json({ error });
  }
}
