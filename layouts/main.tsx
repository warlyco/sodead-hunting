import Sidebar from "@/features/navigation/sidebar";
import classnames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

type Props = {
  children: any;
  centered?: boolean;
};

export default function MainLayout({ children, centered }: Props) {
  const Navbar = dynamic(() => import("@/features/navigation/navbar"), {
    ssr: false,
  });

  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar);
  };

  return (
    <div className="bg-stone-900" suppressHydrationWarning={true}>
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
      <Navbar toggleSidebar={toggleSidebar} />
      <Toaster />
      <Sidebar isOpenSidebar={isOpenSidebar} toggleSidebar={toggleSidebar} />
    </div>
  );
}
