import styled from "@emotion/styled";

import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationForm from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationForm";
import MyIntegrationHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationHeader";
import WebhookList from "@reearth-cms/components/molecules/MyIntegration/WebhookList";

const MyIntegrationContent: React.FC = () => {
  const { TabPane } = Tabs;
  return (
    <MyIntegrationWrapper>
      <MyIntegrationHeader title="My Integration / Robot Red" />
      <MyIntegrationTabs defaultActiveKey="general">
        <TabPane tab="General" key="general">
          <MyIntegrationForm />
        </TabPane>
        <TabPane tab="Webhook" key="webhook">
          <WebhookList />
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
