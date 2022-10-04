import styled from "@emotion/styled";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationsForm from "@reearth-cms/components/molecules/MyIntegrations/Form";
import WebhookForm from "@reearth-cms/components/molecules/MyIntegrations/WebhookForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegrations/WebhookList";

const MyIntegrationsContent: React.FC = () => {
  const { tab, workspaceId, integrationId } = useParams();
  const isFormEdit = location.pathname.includes("/webhooks/edit");
  const navigate = useNavigate();

  const { TabPane } = Tabs;
  return (
    <MyIntegrationWrapper>
      <PageHeader title="My Integration / Robot Red" />
      <MyIntegrationTabs
        defaultActiveKey="integration"
        activeKey={tab}
        onChange={key => {
          navigate(`/workspaces/${workspaceId}/myIntegrations/${integrationId}/${key}`);
        }}>
        <TabPane tab="General" key="integration">
          <MyIntegrationsForm />
        </TabPane>
        <TabPane tab="Webhook" key="webhooks">
          {isFormEdit ? <WebhookForm /> : <WebhookList />}
        </TabPane>
        <TabPane tab="Logs" key="logs" />
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

export default MyIntegrationsContent;
