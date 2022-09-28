import { useParams } from "react-router-dom";

import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationContent";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const { integrationId, webhookId } = useParams();
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
    />
  ) : null;
};

export default MyIntegrationDetails;
