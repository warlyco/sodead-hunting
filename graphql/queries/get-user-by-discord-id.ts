import { gql } from "@apollo/client";

export const GET_USER_BY_DISCORD_ID = gql`
  query GET_USER_BY_DISCORD_ID($discordId: [String!]!) {
    sodead_users(
      where: {
        accounts: {
          providerAccountId: { _in: $discordId }
          provider: { id: { _eq: "eea4c92e-4ac4-4203-8c19-cba7f7b8d4f6" } }
        }
      }
    ) {
      id
      email
      name
      imageUrl
      primaryWallet {
        address
        id
      }
      wallets {
        address
        id
      }
    }
  }
`;
