import styled from "@emotion/styled";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

import { Webhook } from "../types";

import WebhookCard from "./WebhookCard";

export type Props = {
  webhooks?: Webhook[];
  onWebhookDelete: (webhookId: string) => Promise<void>;
};

const WebhookList: React.FC<Props> = ({ webhooks, onWebhookDelete }) => {
  const { workspaceId, integrationId } = useParams();
  const navigate = useNavigate();
  const t = useT();

  const handleWebhookFormNavigation = useCallback(() => {
    navigate(`/workspaces/${workspaceId}/my-integration/${integrationId}/webhooks/form`);
  }, [navigate, workspaceId, integrationId]);

  return (
    <>
      <ActionWrapper>
        <Button onClick={handleWebhookFormNavigation} type="primary" icon={<Icon icon="plus" />}>
          {t("New Webhook")}
        </Button>
      </ActionWrapper>
      {webhooks && webhooks.length > 0 ? (
        <ListWrapper>
          {webhooks.map(webhook => (
            <WebhookCard key={webhook.id} webhook={webhook} onWebhookDelete={onWebhookDelete} />
          ))}
        </ListWrapper>
      ) : (
        <EmptyListWrapper>
          <Title>{t("No Webhook yet")}</Title>
          <Suggestion>
            {t("Create a new ")}
            <Button
              onClick={handleWebhookFormNavigation}
              type="primary"
              icon={<Icon icon="plus" />}>
              {t("New Webhook")}
            </Button>
          </Suggestion>
          <Suggestion>
            {t("Or read")} <a href="">{t("how to use Re:Earth CMS")}</a> {t("first")}
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
  margin: 8px 0;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #00000073;
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

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
`;

export default WebhookList;
