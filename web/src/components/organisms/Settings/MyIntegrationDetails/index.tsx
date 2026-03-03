import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegrations/Content";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const {
    createWebhookLoading,
    handleIntegrationDelete,
    handleIntegrationHeaderBack,
    handleIntegrationUpdate,
    handleRegenerateToken,
    handleWebhookCreate,
    handleWebhookDelete,
    handleWebhookUpdate,
    loading,
    regenerateLoading,
    selectedIntegration,
    updateIntegrationLoading,
    updateWebhookLoading,
  } = useHooks();

  return (
    <MyIntegrationContent
      createWebhookLoading={createWebhookLoading}
      integration={selectedIntegration}
      loading={loading}
      onIntegrationDelete={handleIntegrationDelete}
      onIntegrationHeaderBack={handleIntegrationHeaderBack}
      onIntegrationUpdate={handleIntegrationUpdate}
      onRegenerateToken={handleRegenerateToken}
      onWebhookCreate={handleWebhookCreate}
      onWebhookDelete={handleWebhookDelete}
      onWebhookUpdate={handleWebhookUpdate}
      regenerateLoading={regenerateLoading}
      updateIntegrationLoading={updateIntegrationLoading}
      updateWebhookLoading={updateWebhookLoading}
    />
  );
};

export default MyIntegrationDetails;
