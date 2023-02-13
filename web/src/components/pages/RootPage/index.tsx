import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Loading from "@reearth-cms/components/atoms/Loading";
import { useGetMeQuery } from "@reearth-cms/gql/graphql-client-api";
import { useUserId, useWorkspace } from "@reearth-cms/state";

const RootPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const { data } = useGetMeQuery();

  const [currentUserId] = useUserId();
  const [currentWorkspace, serCurrentWorkspace] = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (data?.me?.id) {
        if (currentWorkspace && currentUserId === data.me.id) {
          navigate(`workspace/${currentWorkspace.id}`);
        } else {
          serCurrentWorkspace(undefined);
          navigate("workspace");
        }
      }
    }
    if (!isAuthenticated && !isLoading) {
      login();
    }
  }, [
    isAuthenticated,
    currentUserId,
    currentWorkspace,
    data?.me?.id,
    isLoading,
    navigate,
    login,
    serCurrentWorkspace,
  ]);

  return isLoading ? <Loading spinnerSize="large" minHeight="100vh" /> : null;
};

export default RootPage;
