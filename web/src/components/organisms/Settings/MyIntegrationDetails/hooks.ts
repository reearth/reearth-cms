import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  IntegrationInfo,
  Webhook,
  NewWebhook,
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
  const { workspaceId, integrationId } = useParams();
  const navigate = useNavigate();
  const { loading, integrations } = integrationHooks();
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
    async ({ name, description, logoUrl }: IntegrationInfo) => {
      if (!integrationId) return;
      const result = await updateIntegrationMutation({
        variables: {
          integrationId,
          name,
          description,
          logoUrl,
        },
      });
      if (result.error) {
        Notification.error({ title: t("Failed to update integration.") });
      } else {
        Notification.success({ title: t("Successfully updated integration!") });
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
      Notification.error({ title: t("Failed to delete integration.") });
    } else {
      Notification.success({ title: t("Successfully deleted integration!") });
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
        title: t("The attempt to re-generate the integration token has failed."),
      });
    } else {
      Notification.success({
        title: t("Integration Token has been re-generated!"),
      });
    }
  }, [integrationId, regenerateTokenMutation, t]);

  const [createNewWebhook, { loading: createWebhookLoading }] = useMutation(CreateWebhookDocument, {
    refetchQueries: [{ query: GetMeDocument }],
  });

  const handleWebhookCreate = useCallback(
    async ({ name, url, active, trigger, secret }: NewWebhook) => {
      if (!integrationId) return;
      const webhook = await createNewWebhook({
        variables: {
          integrationId,
          name,
          url,
          active,
          trigger,
          secret,
        },
      });
      if (webhook.error || !webhook.data?.createWebhook) {
        Notification.error({ title: t("Failed to create webhook.") });
        return;
      }
      Notification.success({ title: t("Successfully created webhook!") });
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
        Notification.error({ title: t("Failed to delete webhook.") });
        return;
      }
      Notification.success({ title: t("Successfully deleted webhook!") });
    },
    [deleteWebhook, integrationId, t],
  );

  const [updateWebhook, { loading: updateWebhookLoading }] = useMutation(UpdateWebhookDocument, {
    refetchQueries: [{ query: GetMeDocument }],
  });

  const handleWebhookUpdate = useCallback(
    async ({ id, name, url, active, trigger, secret }: Webhook) => {
      if (!integrationId) return;
      const webhook = await updateWebhook({
        variables: {
          integrationId,
          webhookId: id,
          name,
          active,
          trigger,
          url,
          secret,
        },
      });
      if (webhook.error || !webhook.data?.updateWebhook) {
        Notification.error({ title: t("Failed to update webhook.") });
        return;
      }
      Notification.success({ title: t("Successfully updated webhook!") });
    },
    [updateWebhook, integrationId, t],
  );

  const handleIntegrationHeaderBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/myIntegrations`);
  }, [navigate, workspaceId]);

  return {
    loading,
    selectedIntegration,
    updateIntegrationLoading,
    regenerateLoading,
    createWebhookLoading,
    updateWebhookLoading,
    handleIntegrationUpdate,
    handleIntegrationDelete,
    handleRegenerateToken,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
    handleIntegrationHeaderBack,
  };
};
