import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegrations/Content";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const {
    loading,
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

  return loading ? (
    <Loading spinnerSize="large" minHeight="100%" />
  ) : selectedIntegration ? (
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
  ) : (
    <NotFound />
  );
};

export default MyIntegrationDetails;
