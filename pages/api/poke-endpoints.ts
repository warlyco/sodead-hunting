// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { BASE_URL } from "@/constants/constants";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

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
  const pokedEndpoints = [];
  for (let endpoint of endpoints) {
    const url = `${BASE_URL}/api/${endpoint}`;
    const { data } = await axios.post(url, { noop: true });
    if (data.noop) {
      pokedEndpoints.push(url);
    }
  }
  if (endpoints.length !== pokedEndpoints.length) {
    res.status(500).json({
      success: false,
      message: "Not all endpoints could be poked",
      endpoints: pokedEndpoints,
    });
    return;
  }
  res.status(200).json({ success: true, endpoints: pokedEndpoints });
}
