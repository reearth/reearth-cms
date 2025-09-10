import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Loading from "@reearth-cms/components/atoms/Loading";
import { useUserId, useWorkspaceId } from "@reearth-cms/state";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import { useQuery } from "@apollo/client/react";

const RootPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { data } = useQuery(GetMeDocument);

  const [currentUserId] = useUserId();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useWorkspaceId();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (data?.me?.id) {
        if (currentWorkspaceId && currentUserId === data.me.id) {
          navigate(`/workspace/${currentWorkspaceId || ""}`);
        } else {
          setCurrentWorkspaceId(undefined);
          navigate("/workspace");
        }
      }
    }
    if (!isAuthenticated && !isLoading) {
      login();
    }
  }, [
    isAuthenticated,
    currentUserId,
    currentWorkspaceId,
    data?.me?.id,
    isLoading,
    navigate,
    login,
    setCurrentWorkspaceId,
  ]);

  return isLoading ? <Loading spinnerSize="large" minHeight="100vh" /> : null;
};

export default RootPage;
