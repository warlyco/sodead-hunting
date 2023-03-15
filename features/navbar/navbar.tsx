import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="relative mx-auto h-28 max-w-5xl pt-12">
      <div className="flex w-full items-center gap-4 rounded-full bg-black py-4 shadow-deep">
        <Link href="/" className="absolute">
          <Image
            src="/images/sodead-logo.png"
            alt="SoDead Logo"
            width={120}
            height={120}
          />
        </Link>
        <div className="w-[100px]" />
        <div className="relative flex w-full items-center justify-between px-8 text-3xl text-red-500">
          <div>SoDead Hunting</div>
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
