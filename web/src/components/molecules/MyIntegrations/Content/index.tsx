import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationForm from "@reearth-cms/components/molecules/MyIntegrations/Form";
import {
  Integration,
  WebhookTrigger,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import WebhookForm from "@reearth-cms/components/molecules/MyIntegrations/WebhookForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegrations/WebhookList";

export type Props = {
  integration: Integration;
  webhookInitialValues?: any;
  activeTab?: string;
  showWebhookForm: boolean;
  onIntegrationUpdate: (data: { name: string; description: string; logoUrl: string }) => void;
  onWebhookCreate: (data: {
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
  }) => Promise<void>;
  onWebhookDelete: (webhookId: string) => Promise<void>;
  onWebhookUpdate: (data: {
    webhookId: string;
    name: string;
    url: string;
    active: boolean;
    trigger: WebhookTrigger;
  }) => Promise<void>;
  onIntegrationHeaderBack: () => void;
  onWebhookFormHeaderBack: () => void;
  onWebhookFormNavigation: () => void;
  onWebhookEditNavigation: (webhookId: string) => void;
  onTabChange: (key: string) => void;
};

const MyIntegrationContent: React.FC<Props> = ({
  integration,
  webhookInitialValues,
  activeTab,
  showWebhookForm,
  onIntegrationUpdate,
  onWebhookCreate,
  onWebhookDelete,
  onWebhookUpdate,
  onIntegrationHeaderBack,
  onWebhookFormHeaderBack,
  onWebhookFormNavigation,
  onWebhookEditNavigation,
  onTabChange,
}) => {
  const { TabPane } = Tabs;

  return (
    <MyIntegrationWrapper>
      <PageHeader title={integration.name} onBack={onIntegrationHeaderBack} />
      <MyIntegrationTabs
        defaultActiveKey="integration"
        activeKey={activeTab}
        onChange={onTabChange}>
        <TabPane tab="General" key="integration">
          <MyIntegrationForm integration={integration} onIntegrationUpdate={onIntegrationUpdate} />
        </TabPane>
        <TabPane tab="Webhook" key="webhooks">
          {showWebhookForm ? (
            <WebhookForm
              onBack={onWebhookFormHeaderBack}
              onWebhookCreate={onWebhookCreate}
              onWebhookUpdate={onWebhookUpdate}
              webhookInitialValues={webhookInitialValues}
            />
          ) : (
            <WebhookList
              webhooks={integration.config.webhooks}
              onWebhookDelete={onWebhookDelete}
              onWebhookUpdate={onWebhookUpdate}
              onWebhookFormNavigation={onWebhookFormNavigation}
              onWebhookEditNavigation={onWebhookEditNavigation}
            />
          )}
        </TabPane>
      </MyIntegrationTabs>
    </MyIntegrationWrapper>
  );
};

const MyIntegrationWrapper = styled.div`
  min-height: 100%;
  background-color: #fff;
`;

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationContent;
