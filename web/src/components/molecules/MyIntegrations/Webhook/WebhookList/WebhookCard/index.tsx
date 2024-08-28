import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import Switch from "@reearth-cms/components/atoms/Switch";
import { Webhook, WebhookTrigger } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useCallback, useState } from "react";

type Props = {
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
  const [isLoading, setIsLoading] = useState(false);

  const handleWebhookDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      await onWebhookDelete(webhook.id);
    } finally {
      setIsLoading(false);
    }
  }, [onWebhookDelete, webhook.id]);

  const handleWebhookUpdate = useCallback(
    (active: boolean) => {
      onWebhookUpdate({ ...webhook, active, webhookId: webhook.id });
    },
    [onWebhookUpdate, webhook],
  );

  return (
    <StyledCard
      title={
        <>
          <WebhookTitle>{webhook.name}</WebhookTitle>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={webhook.active}
            onChange={handleWebhookUpdate}
          />
        </>
      }
      extra={
        <Space size={4}>
          <Button
            type="text"
            shape="circle"
            size="small"
            onClick={() => onWebhookSettings(webhook.id)}
            icon={<Icon icon="settings" size={16} />}
          />
          <Button
            type="text"
            shape="circle"
            size="small"
            onClick={handleWebhookDelete}
            loading={isLoading}
            icon={<Icon icon="delete" size={16} />}
          />
        </Space>
      }>
      {webhook.url}
    </StyledCard>
  );
};

const WebhookTitle = styled.span`
  display: inline-block;
  margin-right: 8px;
`;

const StyledCard = styled(Card)`
  margin-top: 16px;
`;

export default WebhookCard;
