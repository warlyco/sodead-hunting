import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import collectionHashList from "@/features/hashlist/sodead-full-collection.json";
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { addTraitsToDb } from "@/utils/nfts/add-traits-to-db";
import axios from "axios";
import { useAdmin } from "@/hooks/admin";
import { useRouter } from "next/router";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { useFormik } from "formik";
import { useUser } from "@/hooks/user";
import { SubmitButton } from "@/features/UI/buttons/submit-button";

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [mintAddress, setMintAddress] = useState("");
  const { user, setUser } = useUser();

  const fetchCollection = useCallback(async () => {
    // get first 10 items from collectionHashList
    // const START = 6000;
    // const END = collectionHashList.length;
    // const selection = collectionHashList.slice(START, END);
    const selection = [mintAddress];
    if (!selection.length) return;
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
      "334a2b4f-b0c6-4128-94b5-0123cb1bff0a" // sodead
    );
    console.log({ nftsWithMetadata });
    console.log(nftMetasFromMetaplex.length, nftsWithMetadata.length);

    const { data } = await axios.post("/api/add-creatures-from-nfts", {
      nfts: nftsWithMetadata,
    });

    console.log(nftMetasFromMetaplex, nftsWithMetadata, data);
  }, [mintAddress, publicKey, connection]);

  const formik = useFormik({
    initialValues: {
      mintAddress: "",
    },
    onSubmit: async ({ mintAddress }) => {
      setMintAddress(mintAddress);
      fetchCollection();
    },
  });

  useEffect(() => {
    if (!user) return;
    if (user && !isAdmin) {
      router.push("/");
      return;
    }
  }, [connection, publicKey, isAdmin, router, user]);

  if (!isAdmin) return null;

  return (
    <ContentWrapper>
      <FormWrapper onSubmit={formik.handleSubmit}>
        <FormInputWithLabel
          label="Mint address"
          name="mintAddress"
          value={formik.values.mintAddress}
          onChange={formik.handleChange}
        />
      </FormWrapper>
      <div className="flex w-full justify-center mt-8">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
          disabled={!formik.values.mintAddress}
        />
      </div>
    </ContentWrapper>
  );
}
