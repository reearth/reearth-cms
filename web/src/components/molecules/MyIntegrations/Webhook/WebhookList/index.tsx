import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Webhook } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { Trans, useT } from "@reearth-cms/i18n";

import WebhookCard from "./WebhookCard";

type Props = {
  onShowForm: () => void;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookSelect: (id: string) => void;
  onWebhookUpdate: (data: Webhook) => Promise<void>;
  webhooks: Webhook[];
};

const WebhookList: React.FC<Props> = ({
  onShowForm,
  onWebhookDelete,
  onWebhookSelect,
  onWebhookUpdate,
  webhooks,
}) => {
  const t = useT();

  return (
    <>
      <ActionWrapper>
        <Button icon={<Icon icon="plus" />} onClick={onShowForm} type="primary">
          {t("New Webhook")}
        </Button>
      </ActionWrapper>
      {webhooks.length > 0 ? (
        <ListWrapper>
          {webhooks.map(webhook => (
            <WebhookCard
              key={webhook.id}
              onWebhookDelete={onWebhookDelete}
              onWebhookSelect={onWebhookSelect}
              onWebhookUpdate={onWebhookUpdate}
              webhook={webhook}
            />
          ))}
        </ListWrapper>
      ) : (
        <EmptyListWrapper>
          <Title>{t("No Webhook yet")}</Title>
          <Suggestion>
            <Text>{t("Create a new")}</Text>
            <Button icon={<Icon icon="plus" />} onClick={onShowForm} type="primary">
              {t("New Webhook")}
            </Button>
          </Suggestion>
          <Suggestion>
            <Trans components={{ l: <a href="" /> }} i18nKey="readDocument" />
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
