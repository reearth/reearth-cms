import styled from "@emotion/styled";

import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationForm from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegration/WebhookList";

const MyIntegrationContent: React.FC = () => {
  const { TabPane } = Tabs;
  return (
    <MyIntegrationTabs defaultActiveKey="general">
      <TabPane tab="General" key="general">
        <MyIntegrationForm />
      </TabPane>
      <TabPane tab="Webhook" key="webhook">
        <WebhookList />
      </TabPane>
    </MyIntegrationTabs>
  );
};

const MyIntegrationTabs = styled(Tabs)`
  background-color: #fff;
  padding: 0 24px;
`;

export default MyIntegrationContent;
