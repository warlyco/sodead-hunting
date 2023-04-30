// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Creature } from "@/features/creatures/creature-list";
import { client } from "@/graphql/backend-client";
import { GET_CREATURE_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-creature-by-token-mint-address";
import { UPDATE_TOKEN } from "@/graphql/mutations/update-token";
import { UPDATE_CREATURE } from "@/graphql/mutations/update-creature";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { Connection } from "@solana/web3.js";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";
import { NoopResponse } from "@/pages/api/add-account";
import { getHashForTraitCombination } from "@/utils/nfts/get-hash-for-trait-combination";
import { REMOVE_TRAIT_INSTANCES_BY_CREATURE_ID } from "@/graphql/mutations/remove-trait-instances-by-creature-id";
import { Trait } from "@/pages/api/add-creatures-from-nfts";
import { GET_TRAIT_BY_NAME } from "@/graphql/queries/get-trait-by-name";
import { ADD_TRAIT_INSTANCE } from "@/graphql/mutations/add-trait-instance";

type Data =
  | any
  | NoopResponse
  | {
      error: unknown;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { mintAddress, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
      endpoint: "update-creature-by-mint-address",
    });

  console.log({ mintAddress });

  if (!mintAddress) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  let response = {};

  const failedUpdates = [];

  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);

  const nftMetasFromMetaplex: any[] = await metaplex
    .nfts()
    .findAllByMintList({ mints: [new PublicKey(mintAddress)] });

  if (!nftMetasFromMetaplex.length) {
    console.log("No nfts fetched from metaplex");
    res
      .status(500)
      .json({ error: `Could not find NFT with address ${mintAddress}` });
    return;
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

  console.log({ nftsWithMetadata });

  // TODO: use creature to get collection id
  await addTraitsToDb(nftsWithMetadata, "334a2b4f-b0c6-4128-94b5-0123cb1bff0a"); // sodead collection id
  const nft = nftsWithMetadata?.[0];

  if (!nft) {
    console.log("No nfts with metadata");
    res
      .status(500)
      .json({ error: `Could not find NFT with address ${mintAddress}` });
    return;
  }

  const { imageUrl, symbol, traits, name } = nft;
  try {
    const { sodead_creatures }: { sodead_creatures: Creature[] } =
      await client.request({
        document: GET_CREATURE_BY_TOKEN_MINT_ADDRESS,
        variables: {
          mintAddress,
        },
      });

    const creature = sodead_creatures?.[0];

    if (!creature || !traits?.length) {
      failedUpdates.push(mintAddress);

      res.status(500).json({
        error: `Could not find creature with mint address ${mintAddress}`,
      });
      return;
    }

    console.log("updating creature", traits);
    const {
      update_sodead_creatures_by_pk,
    }: { update_sodead_creatures_by_pk: Creature } = await client.request({
      document: UPDATE_CREATURE,
      variables: {
        id: creature.id,
        setInput: {
          imageUrl,
          name,
          traitCombinationHash: await getHashForTraitCombination(
            traits?.map(({ name, value }) => ({ name, value })) || []
          ),
        },
      },
    });

    const {
      delete_sodead_traitInstances,
    }: { delete_sodead_traitInstances: any[] } = await client.request({
      document: REMOVE_TRAIT_INSTANCES_BY_CREATURE_ID,
      variables: {
        id: creature.id,
      },
    });

    for (const trait of traits) {
      const { sodead_traits }: { sodead_traits: Trait[] } =
        await client.request({
          document: GET_TRAIT_BY_NAME,
          variables: {
            name: trait.name,
          },
        });

      const traitId = sodead_traits[0].id;
      const {
        insert_sodead_traitInstances_one,
      }: { insert_sodead_traitInstances_one: Data } = await client.request({
        document: ADD_TRAIT_INSTANCE,
        variables: {
          traitId,
          creatureId: update_sodead_creatures_by_pk.id,
          value: trait.value,
        },
      });
    }

    const {
      update_sodead_tokens_by_pk,
    }: { update_sodead_tokens_by_pk: any[] } = await client.request({
      document: UPDATE_TOKEN,
      variables: {
        id: creature.token.id,
        setInput: {
          name,
          symbol,
          imageUrl,
        },
      },
    });

    response = update_sodead_creatures_by_pk;
    console.log("TOKEN UPDATED", update_sodead_tokens_by_pk);
  } catch (error) {
    console.log("```````````FAIL error: ", error);
    res.status(500).json({ error });
  }

  res.status(200).json({
    message: "Successfully updated creature",
    creature: response,
  });
}
