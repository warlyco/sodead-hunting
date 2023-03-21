export const CLUSTER: string =
  process.env.NEXT_PUBLIC_CLUSTER || "mainnet-beta";
export const RPC_ENDPOINT: string = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "";
export const GRAPHQL_API_ENDPOINT: string =
  process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT || "";
export const ADMIN_WALLETS = process.env.NEXT_PUBLIC_ADMIN_WALLETS || "[]";
export const ENV = process.env.NEXT_PUBLIC_ENV || "";
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
