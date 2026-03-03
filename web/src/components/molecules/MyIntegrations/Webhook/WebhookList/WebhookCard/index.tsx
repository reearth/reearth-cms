import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import Switch from "@reearth-cms/components/atoms/Switch";
import { Webhook } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookSelect: (webhookId: string) => void;
  onWebhookUpdate: (data: Webhook) => Promise<void>;
  webhook: Webhook;
};

const WebhookCard: React.FC<Props> = ({
  onWebhookDelete,
  onWebhookSelect,
  onWebhookUpdate,
  webhook,
}) => {
  const t = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const handleWebhookDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      await onWebhookDelete(webhook.id);
    } finally {
      setIsLoading(false);
    }
  }, [onWebhookDelete, webhook.id]);

  const handleWebhookUpdate = useCallback(
    async (active: boolean) => {
      setIsUpdateLoading(true);
      try {
        await onWebhookUpdate({ ...webhook, active });
      } finally {
        setIsUpdateLoading(false);
      }
    },
    [onWebhookUpdate, webhook],
  );

  return (
    <StyledCard
      extra={
        <Space size={4}>
          <Button
            icon={<Icon icon="settings" size={16} />}
            onClick={() => onWebhookSelect(webhook.id)}
            shape="circle"
            size="small"
            type="text"
          />
          <Button
            icon={<Icon icon="delete" size={16} />}
            loading={isLoading}
            onClick={handleWebhookDelete}
            shape="circle"
            size="small"
            type="text"
          />
        </Space>
      }
      title={
        <TitleWrapper>
          <WebhookTitle>{webhook.name}</WebhookTitle>
          <SwitchWrapper>
            <Switch
              checked={webhook.active}
              checkedChildren={t("ON")}
              loading={isUpdateLoading}
              onClick={handleWebhookUpdate}
              unCheckedChildren={t("OFF")}
            />
          </SwitchWrapper>
        </TitleWrapper>
      }>
      <Content>{webhook.url}</Content>
    </StyledCard>
  );
};

const TitleWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding-right: 4px;
`;

const WebhookTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SwitchWrapper = styled.div`
  display: inline-flex;
`;

const StyledCard = styled(Card)`
  margin-top: 16px;
`;

const Content = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default WebhookCard;
