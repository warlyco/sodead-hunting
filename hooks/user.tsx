import { ENV } from "@/constants/constants";
import { User } from "@/features/admin/users/users-list-item";
import { GET_USER_BY_ID } from "@/graphql/queries/get-user-by-user-id";
import { GET_USER_BY_WALLET_ADDRESS } from "@/graphql/queries/get-user-by-wallet-address";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = React.createContext({} as UserContextType);
const { Provider } = UserContext;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const [getUser, { loading }] = useLazyQuery(GET_USER_BY_WALLET_ADDRESS, {
    variables: {
      address: publicKey?.toString(),
    },
    fetchPolicy: "network-only",
    onCompleted: ({ sodead_users }) => {
      const user = sodead_users?.[0];
      if (user) setUser(user);
    },
  });

  useEffect(() => {
    if (publicKey && !user) getUser();
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
  }, [user, router, publicKey, getUser]);

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
