import { useApolloClient } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import {
  useDeleteMeMutation,
  useGetMeQuery,
  useUpdateMeMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const { data } = useGetMeQuery();
  const t = useT();
  const client = useApolloClient();
  const { logout } = useAuth();

  const me: User | undefined = useMemo(() => {
    return data?.me
      ? {
          id: data.me.id,
          name: data.me.name,
          lang: data.me.lang,
          email: data.me.email,
        }
      : undefined;
  }, [data]);

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
    if (!me) return;
    const user = await deleteMeMutation({ variables: { userId: me.id } });
    if (user.errors) {
      Notification.error({ message: t("Failed to delete user.") });
      return;
    } else {
      Notification.success({ message: t("Successfully deleted user!") });
      logout();
    }
  }, [me, deleteMeMutation, logout, t]);

  return {
    me,
    handleUserUpdate,
    handleLanguageUpdate,
    handleUserDelete,
  };
};
