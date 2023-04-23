import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect } from "react";
import collectionHashList from "@/features/hashlist/sodead-full-collection.json";
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";
import axios from "axios";

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const fetchCollection = useCallback(async () => {
    // get first 10 items from collectionHashList
    const START = 6000;
    const END = collectionHashList.length;
    // const selection = collectionHashList.slice(START, END);
    const selection = ["4d63Sz7MgFoFjhebwpZ2Z175BUJvA3LC4StWRveRhAT8"];
    console.log({
      selection: selection.length,

      total: collectionHashList.length,
    });
    if (!publicKey || !connection) return;

    const metaplex = Metaplex.make(connection);

    const mints = selection.map((address) => new PublicKey(address));

    const nftMetasFromMetaplex: any[] = await metaplex
      .nfts()
      .findAllByMintList({ mints });

    if (!nftMetasFromMetaplex.length) {
      console.log("No nfts fetched from metaplex");
      return;
    }

    const nftsWithMetadata = await fetchNftsWithMetadata(
      nftMetasFromMetaplex,
      metaplex
    );

    await addTraitsToDb(
      nftsWithMetadata,
      "334a2b4f-b0c6-4128-94b5-0123cb1bff0a"
    );
    console.log({ nftsWithMetadata });
    console.log(nftMetasFromMetaplex.length, nftsWithMetadata.length);

    const { data } = await axios.post("/api/add-creatures-from-nfts", {
      nfts: nftsWithMetadata,
    });

    console.log(nftMetasFromMetaplex, nftsWithMetadata, data);
  }, [publicKey, connection]);

  useEffect(() => {
    fetchCollection();
  }, [connection, fetchCollection, publicKey]);

  return (
    <div>
      <h1>Fetch Page</h1>
    </div>
  );
}
