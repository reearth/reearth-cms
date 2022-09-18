import styled from "@emotion/styled";

import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationDetailsForm from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsForm";

const MyIntegrationDetailsContent: React.FC = () => {
  const { TabPane } = Tabs;
  return (
    <MyIntegrationTabs defaultActiveKey="1">
      <TabPane tab="General" key="general">
        <MyIntegrationDetailsForm />
      </TabPane>
      <TabPane tab="Webhook 2" key="webhook">
        Content of Tab Pane 2
      </TabPane>
      <TabPane tab="Logs" key="logs">
        Content of Tab Pane 3
      </TabPane>
    </MyIntegrationTabs>
  );
};

const MyIntegrationTabs = styled(Tabs)`
  padding: 0 24px;
`;

export default MyIntegrationDetailsContent;
