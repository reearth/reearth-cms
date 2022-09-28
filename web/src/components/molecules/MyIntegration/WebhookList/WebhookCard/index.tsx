import { Switch } from "antd";
import { useCallback } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";

import { Webhook } from "../../types";

export type Props = {
  webhook: Webhook;
  onWebhookDelete: (webhookId: string) => Promise<void>;
};

const WebhookCard: React.FC<Props> = ({ webhook, onWebhookDelete }) => {
  const handleMemberRemove = useCallback(() => {
    onWebhookDelete(webhook.id);
  }, [onWebhookDelete, webhook.id]);

  return (
    <Card
      style={{ marginTop: 16 }}
      title={
        <>
          {webhook.name} <Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
        </>
      }
      extra={
        <>
          <Icon icon="settings" onClick={() => {}} />
          <Icon icon="delete" onClick={handleMemberRemove} />
        </>
      }>
      {webhook.url}
    </Card>
  );
};

export default WebhookCard;
