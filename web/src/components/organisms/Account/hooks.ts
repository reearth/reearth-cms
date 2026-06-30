import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { useAuth } from "@reearth-cms/auth";
import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import {
  DeleteMeDocument,
  GetMeDocument,
  UpdateMeDocument,
} from "@reearth-cms/gql/__generated__/user.generated";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const { data, loading } = useQuery(GetMeDocument);
  const t = useT();
  const { logout } = useAuth();

  const me = useMemo<User | undefined>(() => {
    return data?.me
      ? {
          id: data.me.id,
          name: data.me.name,
          lang: data.me.lang,
          email: data.me.email,
        }
      : undefined;
  }, [data]);

  const [updateMeMutation] = useMutation(UpdateMeDocument, {
    refetchQueries: ["GetMe"],
  });
  const [deleteMeMutation] = useMutation(DeleteMeDocument);

  const handleUserUpdate = useCallback(
    async (name: string, email: string) => {
      if (!name || !email) return;
      const user = await updateMeMutation({ variables: { name, email } });
      if (user.error) {
        Notification.error({ title: t("Failed to update user.") });
        return;
      }
      Notification.success({ title: t("Successfully updated user!") });
    },
    [updateMeMutation, t],
  );

  const handleLanguageUpdate = useCallback(
    async (lang: string) => {
      if (!lang) return;
      const res = await updateMeMutation({ variables: { lang } });
      if (res.error) {
        Notification.error({ title: t("Failed to update language.") });
        return;
      } else {
        Notification.success({ title: t("Successfully updated language!", { lng: lang }) });
      }
    },
    [updateMeMutation, t],
  );

  const handleUserDelete = useCallback(async () => {
    if (!me) return;
    const user = await deleteMeMutation({ variables: { userId: me.id } });
    if (user.error) {
      Notification.error({ title: t("Failed to delete user.") });
    } else {
      Notification.success({ title: t("Successfully deleted user!") });
      logout();
    }
  }, [me, deleteMeMutation, logout, t]);

  return {
    me,
    loading,
    handleUserUpdate,
    handleLanguageUpdate,
    handleUserDelete,
  };
};
