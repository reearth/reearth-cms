import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegration/Content";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const { tab, workspaceId, integrationId, webhookId } = useParams();
  const showWebhookForm = location.pathname.includes("/webhooks/form");
  const navigate = useNavigate();

  const handleIntegrationHeaderBack = useCallback(() => {
    navigate(`/workspaces/${workspaceId}/myIntegration`);
  }, [navigate, workspaceId]);

  const handleWebhookFormHeaderBack = useCallback(() => {
    navigate(`/workspaces/${workspaceId}/myIntegrations/${integrationId}/webhooks`);
  }, [navigate, workspaceId, integrationId]);

  const handleTabChange = useCallback(
    (key: string) => {
      navigate(`/workspaces/${workspaceId}/myIntegrations/${integrationId}/${key}`);
    },
    [navigate, workspaceId, integrationId],
  );

  const {
    selectedIntegration,
    webhookInitialValues,
    handleIntegrationUpdate,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
  } = useHooks({
    integrationId,
    webhookId,
  });

  return selectedIntegration ? (
    <MyIntegrationContent
      integration={selectedIntegration}
      webhookInitialValues={webhookInitialValues}
      onIntegrationUpdate={handleIntegrationUpdate}
      onWebhookCreate={handleWebhookCreate}
      onWebhookDelete={handleWebhookDelete}
      onWebhookUpdate={handleWebhookUpdate}
      onIntegrationHeaderBack={handleIntegrationHeaderBack}
      onWebhookFormHeaderBack={handleWebhookFormHeaderBack}
      onTabChange={handleTabChange}
      activeTab={tab}
      showWebhookForm={showWebhookForm}
    />
  ) : null;
};

export default MyIntegrationDetails;
