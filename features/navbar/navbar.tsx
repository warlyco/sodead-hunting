import { useAdmin } from "@/hooks/admin";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { KeyIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const { isAdmin } = useAdmin();

  return (
    <div className="relative mx-auto -mb-28 h-28 max-w-5xl pt-8 px-4 md:px-0">
      <div className="flex w-full items-center justify-between gap-4 rounded-full border border-stone-900 bg-black px-10 shadow-deep py-2">
        <Link href="/" className="block flex-none">
          <Image
            className="h-16 hidden md:block"
            src="/images/sodead-long-logo.png"
            alt="SoDead Logo"
            height={40}
            width={110}
          />
          <div className="py-2 -ml-4">
            <Image
              className="h-8 w-10 md:hidden"
              src="/images/sodead-logo.png"
              alt="SoDead Logo"
              height={40}
              width={40}
            />
          </div>
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
