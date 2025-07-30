import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Loading from "@reearth-cms/components/atoms/Loading";
import Login from "@reearth-cms/components/atoms/LoginPage";
import { useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";
import { useUserId, useWorkspaceId } from "@reearth-cms/state";

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { data } = useGetMeQuery();

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

  return isAuthenticated || isLoading ? <Loading spinnerSize="large" minHeight="100vh" /> : <Login />;
};

export default LoginPage;
