import classnames from "classnames";
import { ClassNames } from "@emotion/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";

type Props = {
  children: any;
};

export default function MainLayout({ children }: Props) {
  const Navbar = dynamic(() => import("@/features/navbar/navbar"), {
    ssr: false,
  });

  return (
    <div className="bg-stone-900" suppressHydrationWarning={true}>
      <Navbar />
      <Toaster />
      <div
        className={classnames({
          "-mt-28": typeof window,
        })}
      >
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-900 via-black to-black">
          {children}
        </main>
      </div>
    </div>
  );
}
