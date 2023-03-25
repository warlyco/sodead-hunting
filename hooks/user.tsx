import { ENV } from "@/constants/constants";
import { User } from "@/features/admin/users/users-list-item";
import { useRouter } from "next/router";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = React.createContext({} as UserContextType);
const { Provider } = UserContext;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (ENV === "production") {
      const handleRouteChange = (url: string) => {
        if (!user) {
          router.push("/me");
        }
      };

      router.events.on("routeChangeStart", handleRouteChange);

      return () => {
        router.events.off("routeChangeStart", handleRouteChange);
      };
    }
  }, [user, router]);

  return (
    <Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </Provider>
  );
};

export const useUser = () => {
  const { user, setUser } = useContext(UserContext);

  return { user, setUser };
};
