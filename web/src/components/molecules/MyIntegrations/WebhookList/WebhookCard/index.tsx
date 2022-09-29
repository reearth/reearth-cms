import { Switch } from "antd";
import { useCallback } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Webhook, WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegrations/types";

export type Props = {
  webhook: Webhook;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: {
    webhookId: string;
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
  }) => Promise<void>;
  onWebhookSettings: (webhookId: string) => void;
};

const WebhookCard: React.FC<Props> = ({
  webhook,
  onWebhookDelete,
  onWebhookUpdate,
  onWebhookSettings,
}) => {
  const handleWebhookDelete = useCallback(() => {
    onWebhookDelete(webhook.id);
  }, [onWebhookDelete, webhook.id]);

  const handleWebhookUpdate = useCallback(
    (active: boolean) => {
      onWebhookUpdate({ ...webhook, active, webhookId: webhook.id });
    },
    [onWebhookUpdate, webhook],
  );

  return (
    <Card
      style={{ marginTop: 16 }}
      title={
        <>
          {webhook.name}{" "}
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={webhook.active}
            onChange={handleWebhookUpdate}
          />
        </>
      }
      extra={
        <>
          <Icon icon="settings" onClick={() => onWebhookSettings(webhook.id)} />
          <Icon icon="delete" onClick={handleWebhookDelete} />
        </>
      }>
      {webhook.url}
    </Card>
  );
};

export default WebhookCard;
