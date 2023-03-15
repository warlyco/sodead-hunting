import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();
  return (
    <div className="relative mx-auto -mb-28 h-28 max-w-5xl pt-12">
      <div className="flex w-full items-center justify-between gap-4 rounded-full border border-stone-900 bg-black px-10 shadow-deep">
        <Link href="/" className="block">
          <Image
            src="/images/sodead-long-logo.png"
            alt="SoDead Logo"
            width={160}
            height={120}
          />
        </Link>
        <div className="flex items-center space-x-6">
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
