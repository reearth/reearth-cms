import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

import WebhookCard from "./WebhookCard";

export type Props = {
  webhooks?: any[];
};

const WebhookList: React.FC<Props> = ({ webhooks }) => {
  const t = useT();
  return (
    <>
      <ActionWrapper>
        <Button onClick={() => {}} type="primary" icon={<Icon icon="plus" />}>
          {t("New Webhook")}
        </Button>
      </ActionWrapper>
      {webhooks && webhooks.length > 0 ? (
        <ListWrapper>
          <WebhookCard title="Item_Hook" url="https://reearth.io/itemchanged" />
        </ListWrapper>
      ) : (
        <EmptyListWrapper>
          <Title>{t("No Webhook yet")}</Title>
          <Suggestion>
            {t("Create a new ")}
            <Button onClick={() => {}} type="primary" icon={<Icon icon="plus" />}>
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
