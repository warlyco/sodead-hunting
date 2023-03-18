import { useAdmin } from "@/hooks/admin";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { KeyIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const { isAdmin } = useAdmin();

  return (
    <div className="relative mx-auto -mb-28 h-28 max-w-5xl pt-12">
      <div className="flex w-full items-center justify-between gap-4 rounded-full border border-stone-900 bg-black px-10 shadow-deep">
        <Link href="/" className="block">
          <Image
            className="h-16"
            src="/images/sodead-long-logo.png"
            alt="SoDead Logo"
            height={40}
            width={110}
          />
        </Link>
        <div className="flex items-center space-x-6">
          {isAdmin && (
            <Link href="/admin" className="p-3 rounded-2xl bg-stone-900">
              <KeyIcon className="w-6 h-6 text-stone-300" />
            </Link>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
