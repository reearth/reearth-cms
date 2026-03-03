import MyIntegrationsWrapper from "@reearth-cms/components/molecules/MyIntegrations";

import useHooks from "./hooks";

const MyIntegrations: React.FC = () => {
  const { createLoading, handleIntegrationCreate, handleIntegrationNavigate, integrations } =
    useHooks();

  return (
    <MyIntegrationsWrapper
      createLoading={createLoading}
      integrations={integrations}
      onIntegrationCreate={handleIntegrationCreate}
      onIntegrationNavigate={handleIntegrationNavigate}
    />
  );
};

export default MyIntegrations;
