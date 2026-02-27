import styled from "@emotion/styled";

import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationSettings from "@reearth-cms/components/molecules/MyIntegrations/Settings";
import {
  Integration,
  IntegrationInfo,
  NewWebhook,
  Webhook as WebhookType,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import Webhook from "@reearth-cms/components/molecules/MyIntegrations/Webhook";
import { useT } from "@reearth-cms/i18n";

const { TabPane } = Tabs;

type Props = {
  createWebhookLoading: boolean;
  integration?: Integration;
  loading: boolean;
  onIntegrationDelete: () => Promise<void>;
  onIntegrationHeaderBack: () => void;
  onIntegrationUpdate: (data: IntegrationInfo) => Promise<void>;
  onRegenerateToken: () => Promise<void>;
  onWebhookCreate: (data: NewWebhook) => Promise<void>;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: WebhookType) => Promise<void>;
  regenerateLoading: boolean;
  updateIntegrationLoading: boolean;
  updateWebhookLoading: boolean;
};

const MyIntegrationContent: React.FC<Props> = ({
  createWebhookLoading,
  integration,
  loading,
  onIntegrationDelete,
  onIntegrationHeaderBack,
  onIntegrationUpdate,
  onRegenerateToken,
  onWebhookCreate,
  onWebhookDelete,
  onWebhookUpdate,
  regenerateLoading,
  updateIntegrationLoading,
  updateWebhookLoading,
}) => {
  const t = useT();

  return loading ? (
    <Loading minHeight="100%" spinnerSize="large" />
  ) : integration ? (
    <MyIntegrationWrapper>
      <PageHeader
        onBack={onIntegrationHeaderBack}
        title={`${t("My Integration")} / ${integration.name}`}
      />
      <MyIntegrationTabs defaultActiveKey="integration">
        <TabPane key="integration" tab={t("General")}>
          <MyIntegrationSettings
            integration={integration}
            onIntegrationDelete={onIntegrationDelete}
            onIntegrationUpdate={onIntegrationUpdate}
            onRegenerateToken={onRegenerateToken}
            regenerateLoading={regenerateLoading}
            updateIntegrationLoading={updateIntegrationLoading}
          />
        </TabPane>
        <TabPane key="webhooks" tab={t("Webhook")}>
          <Webhook
            createWebhookLoading={createWebhookLoading}
            integration={integration}
            onWebhookCreate={onWebhookCreate}
            onWebhookDelete={onWebhookDelete}
            onWebhookUpdate={onWebhookUpdate}
            updateWebhookLoading={updateWebhookLoading}
          />
        </TabPane>
      </MyIntegrationTabs>
    </MyIntegrationWrapper>
  ) : (
    <NotFound />
  );
};

const MyIntegrationWrapper = styled.div`
  min-height: calc(100% - 16px);
  background-color: #fff;
  margin: 16px 16px 0;
`;

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationContent;
