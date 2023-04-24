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

const getEndpoints = (responses: { data: { endpoint: string } }[]) => {
  return responses.map((response) => response?.data?.endpoint) || [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const api = axios.create({
    baseURL: `${BASE_URL}/api/`,
  });

  const { shouldFetchConcurrently = true } = req.body;

  let responses = [];
  let manager;

  if (shouldFetchConcurrently) {
    const manager = ConcurrencyManager(api, 20);

    responses = await Promise.all(
      endpoints.map((endpoint) =>
        api.post(endpoint, {
          noop: true,
        })
      )
    );

    console.log(responses);
  } else {
    for (let endpoint of endpoints) {
      const url = `${BASE_URL}/api/${endpoint}`;
      const response = await axios.post(url, { noop: true });
      responses.push(response);
    }
  }

  if (endpoints.length !== responses.length) {
    res.status(500).json({
      success: false,
      message: "Only some endpoints were poked",
      endpoints: getEndpoints(responses),
    });
    return;
  }

  if (manager) manager!.detach();

  res.status(200).json({
    success: true,
    endpoints: getEndpoints(responses),
  });
}
