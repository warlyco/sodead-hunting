import classnames from "classnames";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";

type Props = {
  children: any;
  centered?: boolean;
};

export default function MainLayout({ children, centered }: Props) {
  const Navbar = dynamic(() => import("@/features/navbar/navbar"), {
    ssr: false,
  });

  return (
    <div className="bg-stone-900" suppressHydrationWarning={true}>
      <Navbar />
      <Toaster />
      <div>
        <main
          className={classnames([
            "min-h-screen bg-gradient-to-b from-stone-900 via-black to-black",
            centered && "flex flex-col items-center justify-center",
          ])}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
