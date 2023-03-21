import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { AddTokenForm } from "@/features/admin/tokens/add-token-form";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";

export default function CreateTokenPage() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <div className="flex w-full mb-8 px-4">
        <BackButton />
      </div>
      <div className="text-center text-3xl mb-8">Add Token</div>
      <AddTokenForm />
    </ContentWrapper>
  );
}
