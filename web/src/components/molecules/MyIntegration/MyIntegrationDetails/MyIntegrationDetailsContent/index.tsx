import styled from "@emotion/styled";

import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationDetailsForm from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegration/WebhookList";

import { Integration } from "../../types";
import WebhookForm from "../../WebhookForm";

export interface Props {
  integration?: Integration;
  handleIntegrationUpdate: (data: { name: string; description: string; logoUrl: string }) => void;
}

const MyIntegrationDetailsContent: React.FC<Props> = ({ integration, handleIntegrationUpdate }) => {
  const { TabPane } = Tabs;
  return (
    <MyIntegrationTabs defaultActiveKey="general">
      <TabPane tab="General" key="general">
        <MyIntegrationDetailsForm
          integration={integration}
          handleIntegrationUpdate={handleIntegrationUpdate}
        />
      </TabPane>
      <TabPane tab="Webhook" key="webhook">
        <WebhookList />
      </TabPane>
      <TabPane tab="Webhook form" key="webhookform">
        <WebhookForm />
      </TabPane>
    </MyIntegrationTabs>
  );
};

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationDetailsContent;
