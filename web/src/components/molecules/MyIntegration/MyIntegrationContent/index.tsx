import styled from "@emotion/styled";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Tabs from "@reearth-cms/components/atoms/Tabs";
import MyIntegrationForm from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationForm";
import MyIntegrationHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationHeader";
import WebhookForm from "@reearth-cms/components/molecules/MyIntegration/WebhookForm";
import WebhookList from "@reearth-cms/components/molecules/MyIntegration/WebhookList";

import { Integration } from "../types";

export type Props = {
  integration: Integration;
  onIntegrationUpdate: (data: { name: string; description: string; logoUrl: string }) => void;
};

const MyIntegrationContent: React.FC<Props> = ({ integration, onIntegrationUpdate }) => {
  const { tab, workspaceId, integrationId } = useParams();
  const isFormEdit = location.pathname.includes("/webhooks/edit");
  const navigate = useNavigate();

  const handleIntegrationNavigation = useCallback(() => {
    navigate(`/workspaces/${workspaceId}/my-integration`);
  }, [navigate, workspaceId]);

  const { TabPane } = Tabs;
  return (
    <MyIntegrationWrapper>
      <MyIntegrationHeader title={integration.name} onBack={handleIntegrationNavigation} />
      <MyIntegrationTabs
        defaultActiveKey="integration"
        activeKey={tab}
        onChange={key => {
          navigate(`/workspaces/${workspaceId}/my-integration/${integrationId}/${key}`);
        }}>
        <TabPane tab="General" key="integration">
          <MyIntegrationForm integration={integration} onIntegrationUpdate={onIntegrationUpdate} />
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

export default MyIntegrationContent;
