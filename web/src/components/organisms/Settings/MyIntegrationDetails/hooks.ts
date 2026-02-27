import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  IntegrationInfo,
  NewWebhook,
  Webhook,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import integrationHooks from "@reearth-cms/components/organisms/Settings/MyIntegrations/hooks";
import {
  DeleteIntegrationDocument,
  RegenerateIntegrationTokenDocument,
  UpdateIntegrationDocument,
} from "@reearth-cms/gql/__generated__/integration.generated";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import {
  CreateWebhookDocument,
  DeleteWebhookDocument,
  UpdateWebhookDocument,
} from "@reearth-cms/gql/__generated__/webhook.generated";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const { integrationId, workspaceId } = useParams();
  const navigate = useNavigate();
  const { integrations, loading } = integrationHooks();
  const t = useT();

  const selectedIntegration = useMemo(
    () => integrations?.find(integration => integration.id === integrationId),
    [integrations, integrationId],
  );

  const [updateIntegrationMutation, { loading: updateIntegrationLoading }] = useMutation(
    UpdateIntegrationDocument,
    { refetchQueries: [{ query: GetMeDocument }] },
  );

  const handleIntegrationUpdate = useCallback(
    async ({ description, logoUrl, name }: IntegrationInfo) => {
      if (!integrationId) return;
      const result = await updateIntegrationMutation({
        variables: {
          description,
          integrationId,
          logoUrl,
          name,
        },
      });
      if (result.error) {
        Notification.error({ message: t("Failed to update integration.") });
      } else {
        Notification.success({ message: t("Successfully updated integration!") });
      }
    },
    [integrationId, t, updateIntegrationMutation],
  );

  const [deleteIntegrationMutation] = useMutation(DeleteIntegrationDocument, {
    refetchQueries: [{ query: GetMeDocument }],
  });

  const handleIntegrationDelete = useCallback(async () => {
    if (!integrationId) return;
    const results = await deleteIntegrationMutation({ variables: { integrationId } });
    if (results.error) {
      Notification.error({ message: t("Failed to delete integration.") });
    } else {
      Notification.success({ message: t("Successfully deleted integration!") });
      navigate(`/workspace/${workspaceId}/myIntegrations`);
    }
  }, [integrationId, deleteIntegrationMutation, t, navigate, workspaceId]);

  const [regenerateTokenMutation, { loading: regenerateLoading }] = useMutation(
    RegenerateIntegrationTokenDocument,
    { refetchQueries: [{ query: GetMeDocument }] },
  );

  const handleRegenerateToken = useCallback(async () => {
    if (!integrationId) return;
    const result = await regenerateTokenMutation({
      variables: {
        integrationId,
      },
    });
    if (result.error) {
      Notification.error({
        message: t("The attempt to re-generate the integration token has failed."),
      });
    } else {
      Notification.success({
        message: t("Integration Token has been re-generated!"),
      });
    }
  }, [integrationId, regenerateTokenMutation, t]);

  const [createNewWebhook, { loading: createWebhookLoading }] = useMutation(CreateWebhookDocument, {
    refetchQueries: [{ query: GetMeDocument }],
  });

  const handleWebhookCreate = useCallback(
    async ({ active, name, secret, trigger, url }: NewWebhook) => {
      if (!integrationId) return;
      const webhook = await createNewWebhook({
        variables: {
          active,
          integrationId,
          name,
          secret,
          trigger,
          url,
        },
      });
      if (webhook.error || !webhook.data?.createWebhook) {
        Notification.error({ message: t("Failed to create webhook.") });
        return;
      }
      Notification.success({ message: t("Successfully created webhook!") });
    },
    [createNewWebhook, integrationId, t],
  );

  const [deleteWebhook] = useMutation(DeleteWebhookDocument, {
    refetchQueries: [{ query: GetMeDocument }],
  });

  const handleWebhookDelete = useCallback(
    async (webhookId: string) => {
      if (!integrationId) return;
      const webhook = await deleteWebhook({
        variables: {
          integrationId,
          webhookId,
        },
      });
      if (webhook.error || !webhook.data?.deleteWebhook) {
        Notification.error({ message: t("Failed to delete webhook.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted webhook!") });
    },
    [deleteWebhook, integrationId, t],
  );

  const [updateWebhook, { loading: updateWebhookLoading }] = useMutation(UpdateWebhookDocument, {
    refetchQueries: [{ query: GetMeDocument }],
  });

  const handleWebhookUpdate = useCallback(
    async ({ active, id, name, secret, trigger, url }: Webhook) => {
      if (!integrationId) return;
      const webhook = await updateWebhook({
        variables: {
          active,
          integrationId,
          name,
          secret,
          trigger,
          url,
          webhookId: id,
        },
      });
      if (webhook.error || !webhook.data?.updateWebhook) {
        Notification.error({ message: t("Failed to update webhook.") });
        return;
      }
      Notification.success({ message: t("Successfully updated webhook!") });
    },
    [updateWebhook, integrationId, t],
  );

  const handleIntegrationHeaderBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/myIntegrations`);
  }, [navigate, workspaceId]);

  return {
    createWebhookLoading,
    handleIntegrationDelete,
    handleIntegrationHeaderBack,
    handleIntegrationUpdate,
    handleRegenerateToken,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
    loading,
    regenerateLoading,
    selectedIntegration,
    updateIntegrationLoading,
    updateWebhookLoading,
  };
};
