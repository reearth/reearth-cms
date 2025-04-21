import { useAuth } from "@reearth-cms/auth";

export const useAuthHeader = () => {
  const { getAccessToken } = useAuth();

  const getHeader = async () => {
    const token = await getAccessToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  return { getHeader };
};
