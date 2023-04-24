// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL } from "@/constants/constants";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
const { ConcurrencyManager } = require("axios-concurrency");

type Data = {
  success: boolean;
  message?: string;
  endpoints: string[];
};

const endpoints = [
  "add-account",
  "add-claim",
  "add-creatures-from-nfts",
  "add-item",
  "add-user",
  "bind-item-to-token",
  "enable-disable-activity",
  "enable-disable-loot-box",
  "get-nft-listings-by-wallet-address",
  "get-token-balances-from-helius",
  "get-token-metadata-from-helius",
  "get-tx-info-from-helius",
  "handle-loot-box-claim",
  "remove-from-hunt",
  "remove-user",
  "trait-combination-exists",
  "unbind-item-from-token",
  "update-creature-by-mint-address",
  "update-item",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const api = axios.create({
    baseURL: `${BASE_URL}/api/`,
  });

  const manager = ConcurrencyManager(api, 20);

  const responses: any = await Promise.all(
    endpoints.map((endpoint) =>
      api.post(endpoint, {
        noop: true,
      })
    )
  );

  console.log(responses);

  manager.detach();

  res.status(200).json({
    success: true,
    endpoints:
      responses.map(
        (response: { data: { endpoint: string } }) => response?.data?.endpoint
      ) || [],
  });
}
