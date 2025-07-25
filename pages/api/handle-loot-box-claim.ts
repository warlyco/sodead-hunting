// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import {
  ItemCollection,
  LootBox,
} from "@/features/admin/loot-boxes/loot-box-list-item";
import { client } from "@/graphql/backend-client";
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
import { ADD_LOOTBOX_PAYOUT } from "@/graphql/mutations/add-lootbox-payout";
import { Wallet } from "@/pages/me";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { ADD_LOOTBOX_ITEM_PAYOUT } from "@/graphql/mutations/add-lootbox-item-payout";
import { NoopResponse } from "@/pages/api/add-account";
import { logError } from "@/utils/log-error";

const getWeightedRandomReward = (items: any[], weights: any[]) => {
  var i;

  for (i = 1; i < weights.length; i++) weights[i] += weights[i - 1];

  var random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

  return items[i];
};

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
  | NoopResponse
  | any
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { burnTxAddress, lootBoxId, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "handle-loot-box-claim",
    });

  if (!burnTxAddress || !lootBoxId || !process.env.REWARD_PRIVATE_KEY) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  let burnTxInfo: EnhancedTransactionFromHelius;
  let counter = 0;

  do {
    counter === 0 && (await sleep(2000));
    await sleep(3000);
    console.log(`attempting to fetch tx info from helius: #${counter + 1}`);
    const { data }: { data: EnhancedTransactionFromHelius[] } =
      await fetchInfoFromHelius(burnTxAddress);
    burnTxInfo = data?.[0];
    counter++;
  } while (!burnTxInfo?.slot && counter < 6);

  if (!burnTxInfo?.slot) {
    try {
      logError({
        error: {
          code: 500,
          message: "Could not fetch burn tx info from helius",
          rawError: JSON.stringify({}),
        },
        burnTxAddress,
      });
    } catch (error) {
      console.log("error logging error", error);
    }
    return res
      .status(500)
      .json({ error: "Could not fetch burn tx info from helius" });
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

  // item based costs
  const costs = lootBox?.costCollections?.map((costCollection) => {
    return {
      item: costCollection.itemCollection.item,
      amount: costCollection.itemCollection.amount,
    };
  });

  const rewards = lootBox?.rewardCollections?.map((rewardCollection) => {
    return {
      item: rewardCollection?.itemCollection?.item,
      amount: rewardCollection?.itemCollection?.amount || 1,
      payoutChance: rewardCollection.payoutChance,
      childRewardCollection: rewardCollection?.childRewardCollections || [],
    };
  });

  if (!rewards?.length || !costs?.length) {
    res.status(400).json({ error: "No rewards or costs" });
    return;
  }

  let randomReward = getWeightedRandomReward(
    rewards,
    rewards.map((reward) => reward.payoutChance)
  );

  console.log("possible rewards", rewards);

  if (!randomReward) {
    res.status(400).json({ error: "No reward found" });
    return;
  }

  let childReward: any;
  if (randomReward.childRewardCollection.length) {
    // is parent reward collection, need to select child reward
    const { itemCollection } = getWeightedRandomReward(
      randomReward.childRewardCollection,
      randomReward.childRewardCollection.map(
        (childReward: any) => childReward.payoutChance
      )
    );
    childReward = itemCollection;
  }

  const childRewardMintAddress = childReward?.item?.token?.mintAddress;
  const randomRewardMintAddress = randomReward?.item?.token?.mintAddress;

  console.log({
    childReward: JSON.stringify(childReward),
    childRewardMintAddress,
    randomReward: JSON.stringify(randomReward),
    randomRewardMintAddress,
  });

  let rewardMintAddress = childRewardMintAddress
    ? new PublicKey(childRewardMintAddress)
    : new PublicKey(randomRewardMintAddress);

  let rewardAmount = randomReward?.amount || 1;

  let rewardTxAddress: string;
  const fromUserAccount = new PublicKey(burnTxInfo?.feePayer);

  const fromTokenAccountAddress = await getAssociatedTokenAddress(
    rewardMintAddress,
    rewardPublicKey
  );

  const toTokenAccountAddress = await getAssociatedTokenAddress(
    rewardMintAddress,
    new PublicKey(fromUserAccount)
  );

  const receiverAccount = await connection.getAccountInfo(
    toTokenAccountAddress
  );

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

  const { sodead_wallets }: { sodead_wallets: Wallet[] } = await client.request(
    GET_WALLET_BY_ADDRESS,
    { address: fromUserAccount }
  );

  const walletId = sodead_wallets?.[0]?.id;

  if (!walletId) {
    res.status(400).json({ success: false });
    return;
  }

  let document;
  if (childReward?.item || randomReward?.item) {
    document = ADD_LOOTBOX_ITEM_PAYOUT;
  } else {
    document = ADD_LOOTBOX_PAYOUT;
  }

  let variables: any = {
    txAddress: rewardTxAddress,
    amount: rewardAmount,
    tokenId: childRewardMintAddress
      ? childReward?.item?.token?.id
      : randomReward?.item?.token?.id,
    createdAtWithTimezone: new Date().toISOString(),
    walletId,
    lootBoxId,
  };

  if (childReward?.item || randomReward?.item) {
    variables = {
      ...variables,
      itemId: childReward?.item?.id || randomReward?.item?.id,
    };
  }

  try {
    const { insert_sodead_payouts_one }: { insert_sodead_payouts_one: Payout } =
      await client.request({
        document,
        variables,
      });

    res.status(200).json({
      ...insert_sodead_payouts_one,
      reward: childRewardMintAddress ? childReward : randomReward,
    });
  } catch (error: any) {
    try {
      logError({
        error: {
          code: error?.response?.status || 0,
          message: error?.message,
          rawError: JSON.stringify(error),
        },
        walletId,
        burnTxAddress,
      });
    } catch (error) {
      console.log("error logging error", error);
    }

    console.log(error);
    res.status(500).json({ error });
  }
}
