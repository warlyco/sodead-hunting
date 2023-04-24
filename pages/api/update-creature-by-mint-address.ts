// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Creature } from "@/features/creatures/creature-list";
import { client } from "@/graphql/backend-client";
import { GET_CREATURE_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-creature-by-token-mint-address";
import { UPDATE_CREATURE } from "@/graphql/mutations/update-creature";
import { Metaplex } from "@metaplex-foundation/js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { Connection } from "@solana/web3.js";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";
import { NoopResponse } from "@/pages/api/add-account";

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
  const { mintAddresses, noop } = req.body;

  if (noop)
    return res.status(200).json({
      noop: true,
    });

  console.log({ mintAddresses });

  if (!mintAddresses) {
    res.status(500).json({ error: "Required fields not set" });
    return;
  }

  let response = {};

  const failedUpdates = [];
  const successfulUpdates = [];

  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);

  const nftMetasFromMetaplex: any[] = await metaplex
    .nfts()
    .findAllByMintList({ mints: mintAddresses });

  if (!nftMetasFromMetaplex.length) {
    console.log("No nfts fetched from metaplex");
    return;
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

  // TODO: use creature to get collection id
  await addTraitsToDb(nftsWithMetadata, "334a2b4f-b0c6-4128-94b5-0123cb1bff0a");

  for (let nft of nftsWithMetadata) {
    const { mintAddress, imageUrl, symbol, traits, name } = nft;
    try {
      const { sodead_creatures }: { sodead_creatures: Creature[] } =
        await client.request({
          document: GET_CREATURE_BY_TOKEN_MINT_ADDRESS,
          variables: {
            mintAddress,
          },
        });

      const creature = sodead_creatures?.[0];

      if (!creature) {
        failedUpdates.push(mintAddress);
        continue;
      }

      // update uri ?

      const {
        update_sodead_creatures_by_pk,
      }: { update_sodead_creatures_by_pk: Creature } = await client.request({
        document: UPDATE_CREATURE,
        variables: {
          id: creature.id,
        },
      });

      // delet traits, add new traits

      // traits.forEach(async (trait: Trait) => {
      //   const { sodead_traits }: { sodead_traits: Trait[] } =
      //     await client.request({
      //       document: GET_TRAIT_BY_NAME,
      //       variables: {
      //         name: trait.name,
      //       },
      //     });

      //   const traitId = sodead_traits[0].id;
      //   const {
      //     insert_sodead_traitInstances_one,
      //   }: { insert_sodead_traitInstances_one: Data } = await client.request({
      //     document: ADD_TRAIT_INSTANCE,
      //     variables: {
      //       traitId,
      //       creatureId: update_sodead_creatures_by_pk.id,
      //       value: trait.value,
      //     },
      //   });
      // });

      console.log("Creature added: ", {
        name: update_sodead_creatures_by_pk.name,
      });
      response = { update_sodead_creatures_by_pk };
    } catch (error) {
      console.log("```````````FAIL error: ", error);
      res.status(500).json({ error });
    }
  }

  res.status(200).json(response);
}
