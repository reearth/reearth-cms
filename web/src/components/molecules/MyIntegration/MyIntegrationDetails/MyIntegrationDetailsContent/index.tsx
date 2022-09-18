import styled from "@emotion/styled";

import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationDetailsForm from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegration/WebhookList";

const MyIntegrationDetailsContent: React.FC = () => {
  const { TabPane } = Tabs;
  return (
    <MyIntegrationTabs defaultActiveKey="1">
      <TabPane tab="General" key="general">
        <MyIntegrationDetailsForm />
      </TabPane>
      <TabPane tab="Webhook" key="webhook">
        <WebhookList />
      </TabPane>
    </MyIntegrationTabs>
  );
};

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationDetailsContent;
