import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";
import { useDeleteMeMutation, useUpdateMeMutation } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const userId = "";
  const t = useT();
  const client = useApolloClient();
  const { logout } = useAuth();

  const [updateMeMutation] = useUpdateMeMutation({
    refetchQueries: ["GetMe"],
  });
  const [deleteMeMutation] = useDeleteMeMutation();

  const handleUserUpdate = useCallback(
    async (name?: string, email?: string) => {
      if (!name || !email) return;
      const user = await updateMeMutation({ variables: { name, email } });
      if (user.errors) {
        Notification.error({ message: t("Failed to update user.") });
        return;
      }
      Notification.success({ message: t("Successfully updated user!") });
    },
    [updateMeMutation, t],
  );

  const handleLanguageUpdate = useCallback(
    async (lang?: string) => {
      if (!lang) return;
      const language = await updateMeMutation({ variables: { lang } });
      if (language.errors) {
        Notification.error({ message: t("Failed to update language.") });
        return;
      } else {
        await client.resetStore();
        Notification.success({ message: t("Successfully updated language!") });
      }
    },
    [updateMeMutation, client, t],
  );

  const handleUserDelete = useCallback(async () => {
    if (!userId) return;
    const user = await deleteMeMutation({ variables: { userId } });
    if (user.errors) {
      Notification.error({ message: t("Failed to delete user.") });
      return;
    } else {
      Notification.success({ message: t("Successfully deleted user!") });
      logout();
    }
  }, [deleteMeMutation, logout, t]);

  return {
    handleUserUpdate,
    handleLanguageUpdate,
    handleUserDelete,
  };
};
