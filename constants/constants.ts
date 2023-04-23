export const CLUSTER: string =
  process.env.NEXT_PUBLIC_CLUSTER || "mainnet-beta";
export const RPC_ENDPOINT: string = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
export const GRAPHQL_API_ENDPOINT: string =
  process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT || "";
export const ADMIN_WALLETS = process.env.NEXT_PUBLIC_ADMIN_WALLETS || "[]";
export const ENV = process.env.NEXT_PUBLIC_ENV || "";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
export const BURNING_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_BURNING_WALLET_ADDRESS || "";
export const COLLECTION_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_COLLECTION_WALLET_ADDRESS || "";
export const PLATFORM_TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_TOKEN_MINT_ADDRESS || "";
export const REWARD_TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_REWARD_TOKEN_MINT_ADDRESS || "";

export const HASH_LISTS = {
  "Lady Vampires": "51777308-8f32-4af5-aead-835862f066ce",
  "Lady Vampire Tribes": "f7accf17-1703-4a76-9798-6634a6774a5b",
  "Rare Coffins": "475d8829-44d4-4c29-b788-804cc04c59f4",
  "Epic Coffins": "6b7ba464-3c39-459b-a4ed-a06562a035f0",
  "Uncommon Coffins": "1e4888e9-f0fe-430f-9982-702964736948",
  "All Candies": "f2731e5d-4f3b-480c-8cdc-122f821ed200",
};
