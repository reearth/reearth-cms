import styled from "@emotion/styled";

import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationSettings from "@reearth-cms/components/molecules/MyIntegrations/Settings";
import {
  Integration,
  IntegrationInfo,
  Webhook as WebhookType,
  NewWebhook,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import Webhook from "@reearth-cms/components/molecules/MyIntegrations/Webhook";
import { useT } from "@reearth-cms/i18n";

const { TabPane } = Tabs;

type Props = {
  loading: boolean;
  integration?: Integration;
  updateIntegrationLoading: boolean;
  regenerateLoading: boolean;
  createWebhookLoading: boolean;
  updateWebhookLoading: boolean;
  onIntegrationUpdate: (data: IntegrationInfo) => Promise<void>;
  onIntegrationDelete: () => Promise<void>;
  onRegenerateToken: () => Promise<void>;
  onWebhookCreate: (data: NewWebhook) => Promise<void>;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: WebhookType) => Promise<void>;
  onIntegrationHeaderBack: () => void;
};

const MyIntegrationContent: React.FC<Props> = ({
  loading,
  integration,
  updateIntegrationLoading,
  regenerateLoading,
  createWebhookLoading,
  updateWebhookLoading,
  onIntegrationUpdate,
  onRegenerateToken,
  onWebhookCreate,
  onWebhookDelete,
  onWebhookUpdate,
  onIntegrationHeaderBack,
  onIntegrationDelete,
}) => {
  const t = useT();

  return loading ? (
    <Loading spinnerSize="large" minHeight="100%" />
  ) : integration ? (
    <MyIntegrationWrapper>
      <PageHeader
        title={`${t("My Integration")} / ${integration.name}`}
        onBack={onIntegrationHeaderBack}
      />
      <MyIntegrationTabs defaultActiveKey="integration">
        <TabPane tab={t("General")} key="integration">
          <MyIntegrationSettings
            integration={integration}
            updateIntegrationLoading={updateIntegrationLoading}
            regenerateLoading={regenerateLoading}
            onIntegrationUpdate={onIntegrationUpdate}
            onIntegrationDelete={onIntegrationDelete}
            onRegenerateToken={onRegenerateToken}
          />
        </TabPane>
        <TabPane tab={t("Webhook")} key="webhooks">
          <Webhook
            integration={integration}
            createWebhookLoading={createWebhookLoading}
            updateWebhookLoading={updateWebhookLoading}
            onWebhookCreate={onWebhookCreate}
            onWebhookDelete={onWebhookDelete}
            onWebhookUpdate={onWebhookUpdate}
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
