import { useApolloClient } from "@apollo/client";
import {
  useUpdateMeMutation,
  useGetProfileQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useWorkspace } from "@reearth-cms/state";
import { useCallback } from "react";

export default () => {
  const client = useApolloClient();
  const [currentWorkspace] = useWorkspace();

  const { data: profileData } = useGetProfileQuery();
  const me = profileData?.me;
  const auths = profileData?.me?.auths;
  const hasPassword = auths?.includes("auth0") ?? false;

  const [updateMeMutation] = useUpdateMeMutation();

  const handleNameUpdate = useCallback(
    async (name?: string) => {
      if (!name) return;
      const username = await updateMeMutation({ variables: { name } });
      if (username.errors) {
        //TODO: notification
      }
    },
    [updateMeMutation]
  );

  const updatePassword = useCallback(
    async (password: string, passwordConfirmation: string) => {
      const newPassword = await updateMeMutation({
        variables: { password, passwordConfirmation },
      });
      if (newPassword.errors) {
        //TODO: notification
      } else {
        //TODO: notification
      }
    },
    [updateMeMutation]
  );

  const updateLanguage = useCallback(
    async (lang?: string) => {
      if (!lang) return;
      const language = await updateMeMutation({ variables: { lang } });
      if (language.errors) {
        //TODO: notification
      } else {
        await client.resetStore();
      }
    },
    [updateMeMutation, client]
  );

  return {
    currentWorkspace,
    me,
    hasPassword,
    handleNameUpdate,
    updatePassword,
    updateLanguage,
  };
};
