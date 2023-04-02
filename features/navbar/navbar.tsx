import { useAdmin } from "@/hooks/admin";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { KeyIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const { isAdmin } = useAdmin();

  return (
    <div className="relative -mb-16 h-16  px-4 md:px-0 bg-stone-900 shadow-deep">
      <div className="flex w-full items-center justify-between gap-4 py-2 max-w-5xl mx-auto">
        <div className="flex space-x-8 items-center font-strange-dreams text-base md:text-2xl tracking-wider">
          <Link href="/" className="flex items-center justify-center">
            <Image
              className="h-12 hidden md:block mr-8"
              src="/images/sodead-long-logo.png"
              alt="SoDead Logo"
              height={42}
              width={100}
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
          <Link href="/hunt/active">Hunts</Link>
          <Link href="/loot-box/active">Lootboxes</Link>
        </div>
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
