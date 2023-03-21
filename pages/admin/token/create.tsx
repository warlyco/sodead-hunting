import { useWallet } from "@solana/wallet-adapter-react";
import { ADMIN_WALLETS } from "@/constants/constants";
import { AddTokenForm } from "@/features/admin/tokens/add-token-form";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/admin";

export default function CreateTokenPage() {
  const { publicKey } = useWallet();
  const { isAdmin } = useAdmin();

  if (!isAdmin)
    return (
      <div className="w-full min-h-screen text-stone-300">
        <div className="pt-72 text-center text-3xl">
          You must be an admin to view this page
        </div>
      </div>
    );

  return (
    <ContentWrapper>
      <div className="flex w-full mb-8">
        <BackButton />
      </div>
      <div className="text-center text-3xl mb-8">Add Token</div>
      <AddTokenForm />
    </ContentWrapper>
  );
}
