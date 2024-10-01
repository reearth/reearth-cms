import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegrations/Content";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const {
    selectedIntegration,
    webhookInitialValues,
    updateIntegrationLoading,
    regenerateLoading,
    createWebhookLoading,
    updateWebhookLoading,
    handleIntegrationUpdate,
    handleIntegrationDelete,
    handleRegenerateToken,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
    handleWebhookSelect,
    handleIntegrationHeaderBack,
  } = useHooks();

  return selectedIntegration ? (
    <MyIntegrationContent
      integration={selectedIntegration}
      webhookInitialValues={webhookInitialValues}
      updateIntegrationLoading={updateIntegrationLoading}
      regenerateLoading={regenerateLoading}
      createWebhookLoading={createWebhookLoading}
      updateWebhookLoading={updateWebhookLoading}
      onIntegrationUpdate={handleIntegrationUpdate}
      onIntegrationDelete={handleIntegrationDelete}
      onRegenerateToken={handleRegenerateToken}
      onWebhookCreate={handleWebhookCreate}
      onWebhookDelete={handleWebhookDelete}
      onWebhookUpdate={handleWebhookUpdate}
      onWebhookSelect={handleWebhookSelect}
      onIntegrationHeaderBack={handleIntegrationHeaderBack}
    />
  ) : null;
};

export default MyIntegrationDetails;
