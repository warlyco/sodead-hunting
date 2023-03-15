import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";

const Admin: NextPage = () => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return (
      <ContentWrapper>
        <div>Not Admin</div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="flex justify-center text-stone-300">
      <div className="text-3xl">Admin</div>
    </ContentWrapper>
  );
};

export default Admin;
