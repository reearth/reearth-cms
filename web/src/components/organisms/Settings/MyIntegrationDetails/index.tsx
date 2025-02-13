import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegrations/Content";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const {
    loading,
    selectedIntegration,
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
    handleIntegrationHeaderBack,
  } = useHooks();

  return (
    <MyIntegrationContent
      loading={loading}
      integration={selectedIntegration}
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
      onIntegrationHeaderBack={handleIntegrationHeaderBack}
    />
  );
};

export default MyIntegrationDetails;
