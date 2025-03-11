import { useCallback, useState, useMemo } from "react";

import {
  Integration,
  Webhook as WebhookType,
  NewWebhook,
  TriggerKey,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import WebhookForm from "@reearth-cms/components/molecules/MyIntegrations/Webhook/WebhookForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegrations/Webhook/WebhookList";

type Props = {
  integration: Integration;
  createWebhookLoading: boolean;
  updateWebhookLoading: boolean;
  onWebhookCreate: (data: NewWebhook) => Promise<void>;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: WebhookType) => Promise<void>;
};

const Webhook: React.FC<Props> = ({
  integration,
  createWebhookLoading,
  updateWebhookLoading,
  onWebhookCreate,
  onWebhookDelete,
  onWebhookUpdate,
}) => {
  const [webhookId, setwebhookId] = useState<string>("");
  const [showWebhookForm, changeShowWebhookForm] = useState(false);

  const webhookInitialValues = useMemo(() => {
    if (!integration.config.webhooks || !webhookId) return;
    const selectedWebhook = integration.config.webhooks.find(webhook => webhook.id === webhookId);
    if (!selectedWebhook) return;
    const trigger: TriggerKey[] = [];
    let key: TriggerKey;
    for (key in selectedWebhook.trigger) {
      if (selectedWebhook.trigger[key]) {
        trigger.push(key);
      }
    }
    return { ...selectedWebhook, trigger };
  }, [integration.config.webhooks, webhookId]);

  const handleShowForm = useCallback(() => {
    changeShowWebhookForm(true);
  }, []);

  const handleBack = useCallback(() => {
    setwebhookId("");
    changeShowWebhookForm(false);
  }, []);

  const handleWebhookCreate = useCallback(
    async (data: NewWebhook) => {
      await onWebhookCreate(data);
    },
    [onWebhookCreate],
  );

  const handleWebhookSelect = useCallback(
    (id: string) => {
      setwebhookId(id);
      handleShowForm();
    },
    [handleShowForm],
  );

  return showWebhookForm ? (
    <WebhookForm
      webhookInitialValues={webhookInitialValues}
      loading={createWebhookLoading || updateWebhookLoading}
      onBack={handleBack}
      onWebhookCreate={handleWebhookCreate}
      onWebhookUpdate={onWebhookUpdate}
    />
  ) : (
    <WebhookList
      webhooks={integration.config.webhooks ?? []}
      onWebhookDelete={onWebhookDelete}
      onWebhookUpdate={onWebhookUpdate}
      onWebhookSelect={handleWebhookSelect}
      onShowForm={handleShowForm}
    />
  );
};

export default Webhook;
