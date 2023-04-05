import { gql } from "@apollo/client";

export const GET_CREATURES_BY_TOKEN_MINT_ADDRESSES = gql`
  query GET_CREATURES_BY_TOKEN_MINT_ADDRESSS($mintAddresses: [String!]!) {
    sodead_creatures(
      where: { token: { mintAddress: { _in: $mintAddresses } } }
    ) {
      name
      id
      imageUrl
      token {
        id
        mintAddress
      }
      traitInstances {
        trait {
          name
          id
        }
        id
        value
      }
      mainCharacterActivityInstances {
        id
        startTime
        endTime
        activity {
          id
          startTime
          endTime
        }
      }
    }
  }
`;
