import { useCallback, useState } from "react";

import {
  Integration,
  WebhookTrigger,
  WebhookValues,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import WebhookForm from "@reearth-cms/components/molecules/MyIntegrations/Webhook/WebhookForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegrations/Webhook/WebhookList";

type Props = {
  integration: Integration;
  webhookInitialValues?: WebhookValues;
  onWebhookCreate: (data: {
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
    secret: string;
  }) => Promise<void>;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: {
    webhookId: string;
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
    secret?: string;
  }) => Promise<void>;
  onWebhookSelect: (id: string) => void;
};

const Webhook: React.FC<Props> = ({
  integration,
  webhookInitialValues,
  onWebhookCreate,
  onWebhookDelete,
  onWebhookUpdate,
  onWebhookSelect,
}) => {
  const [showWebhookForm, changeShowWebhookForm] = useState(false);

  const handleShowForm = useCallback(() => {
    changeShowWebhookForm(true);
  }, []);

  const handleBack = useCallback(() => {
    onWebhookSelect("");
    changeShowWebhookForm(false);
  }, [onWebhookSelect]);

  const handleWebhookCreate = useCallback(
    async (data: {
      name: string;
      url: string;
      active: boolean;
      trigger: WebhookTrigger;
      secret: string;
    }) => {
      await onWebhookCreate(data);
      handleBack();
    },
    [onWebhookCreate, handleBack],
  );

  const handleWebhookSelect = useCallback(
    (id: string) => {
      onWebhookSelect(id);
      handleShowForm();
    },
    [onWebhookSelect, handleShowForm],
  );

  return showWebhookForm ? (
    <WebhookForm
      onBack={handleBack}
      onWebhookCreate={handleWebhookCreate}
      onWebhookUpdate={onWebhookUpdate}
      webhookInitialValues={webhookInitialValues}
    />
  ) : (
    <WebhookList
      webhooks={integration.config.webhooks}
      onWebhookDelete={onWebhookDelete}
      onWebhookUpdate={onWebhookUpdate}
      onShowForm={handleShowForm}
      onWebhookSelect={handleWebhookSelect}
    />
  );
};

export default Webhook;
