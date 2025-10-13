import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Webhook } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT, Trans } from "@reearth-cms/i18n";

import WebhookCard from "./WebhookCard";

type Props = {
  webhooks: Webhook[];
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: Webhook) => Promise<void>;
  onWebhookSelect: (id: string) => void;
  onShowForm: () => void;
};

const WebhookList: React.FC<Props> = ({
  webhooks,
  onWebhookDelete,
  onWebhookUpdate,
  onWebhookSelect,
  onShowForm,
}) => {
  const t = useT();

  return (
    <>
      <ActionWrapper>
        <Button onClick={onShowForm} type="primary" icon={<Icon icon="plus" />}>
          {t("New Webhook")}
        </Button>
      </ActionWrapper>
      {webhooks.length > 0 ? (
        <ListWrapper>
          {webhooks.map(webhook => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onWebhookDelete={onWebhookDelete}
              onWebhookUpdate={onWebhookUpdate}
              onWebhookSelect={onWebhookSelect}
            />
          ))}
        </ListWrapper>
      ) : (
        <EmptyListWrapper>
          <Title>{t("No Webhook yet")}</Title>
          <Suggestion>
            <Text>{t("Create a new")}</Text>
            <Button onClick={onShowForm} type="primary" icon={<Icon icon="plus" />}>
              {t("New Webhook")}
            </Button>
          </Suggestion>
          <Suggestion>
            <Trans i18nKey="readDocument" components={{ l: <a href="" /> }} />
          </Suggestion>
        </EmptyListWrapper>
      )}
    </>
  );
};

const ActionWrapper = styled.div`
  text-align: right;
`;

const Suggestion = styled.p`
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #00000073;
`;

const Text = styled.span`
  margin-right: 8px;
`;

const EmptyListWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const ListWrapper = styled.div`
  padding: 12px;
`;

const Title = styled.p`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
  margin-bottom: 24px;
`;

export default WebhookList;
