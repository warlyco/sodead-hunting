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
    <ContentWrapper>
      <div>Admin</div>
    </ContentWrapper>
  );
};

export default Admin;
