import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { useUser } from "@/hooks/user";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

export const UserWithoutAccountBlocker = () => {
  const { publicKey } = useWallet();
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center">
      <ImageWithFallback
        className="mb-8"
        src="/images/sodead-logo.png"
        alt="SoDead Logo"
        width={200}
        height={200}
      />
      <div className="italic">
        {publicKey ? (
          <Link href="/me" className="underline text-red-500">
            Connect to{" "}
            <span className="text-purple-500 uppercase">Discord</span> to
            continue
          </Link>
        ) : (
          <>Connect your wallet to continue</>
        )}
      </div>
    </div>
  );
};
