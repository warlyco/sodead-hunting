import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

export type ModeledNftMetadata = {
  name: string;
  imageUrl: string;
  mintAddress: string;
  description?: string;
  edition?: number;
  fee?: number;
  attributes?: {
    [key: string]: unknown;
    trait_type?: string | undefined;
    value?: string | undefined;
  }[];
  url?: string;
  creators?: {
    [key: string]: unknown;
    address?: string | undefined;
    share?: number | undefined;
  }[];
  symbol?: string;
  freezeAuthorityAddress?: string;
  mintAuthorityAddress?: string;
};

type NftMetadataJson = {
  name: string;
  image: string;
};

interface Props {
  publicKey: PublicKey;
  connection: any;
  setIsLoading?: (isLoading: boolean) => void;
  setHasBeenFetched?: (hasBeenFetched: boolean) => void;
  firstCreatorAddress: string;
}

export const fetchNftsByFisrtCreatorAddress = async ({
  publicKey,
  connection,
  setIsLoading,
  setHasBeenFetched,
  firstCreatorAddress,
}: Props): Promise<any[]> => {
  setIsLoading && setIsLoading(true);
  return new Promise(async (resolve, reject) => {
    const metaplex = Metaplex.make(connection);

    try {
      const nftMetasFromMetaplex: any[] = await metaplex
        .nfts()
        .findAllByOwner({ owner: publicKey });

      const nftCollection = nftMetasFromMetaplex.filter(
        ({ creators }: { creators: any }) => {
          return creators?.[0]?.address?.toString() === firstCreatorAddress;
        }
      );

      if (!nftCollection.length) {
        setIsLoading && setIsLoading(false);
        setHasBeenFetched && setHasBeenFetched(true);
        resolve([]);
        return;
      }

      let nftsWithMetadata: any[] = [];

      for (const nft of nftCollection) {
        const { json, mint } = await metaplex.nfts().load({ metadata: nft });
        const { name, image: imageUrl } = json as NftMetadataJson;
        const { address: mintAddress } = mint;
        debugger;
        const metadata: ModeledNftMetadata = {
          attributes: json?.attributes || [],
          description: json?.description,
          edition: json?.edition as number,
          url: json?.external_url,
          name,
          imageUrl,
          mintAddress: mintAddress.toString(),
          creators: json?.properties?.creators,
          fee: json?.properties?.seller_fee_basis_points as number,
          symbol: json?.symbol,
          freezeAuthorityAddress: mint.freezeAuthorityAddress?.toString(),
          mintAuthorityAddress: mint.mintAuthorityAddress?.toString(),
        };
        nftsWithMetadata.push(metadata);
      }

      resolve(nftsWithMetadata);
    } catch (error) {
      console.log("fetchDaoNfts error", error);
      console.error({ error });
      reject(error);
    } finally {
      setIsLoading && setIsLoading(false);
      setHasBeenFetched && setHasBeenFetched(true);
    }
  });
};
