import { useAuth } from "@reearth-cms/auth";

export const useAuthHeader = () => {
  const { getAccessToken } = useAuth();

  const getHeader = async () => {
    const token = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  return { getHeader };
};
