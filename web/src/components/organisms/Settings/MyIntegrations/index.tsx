import MyIntegrationsWrapper from "@reearth-cms/components/molecules/MyIntegrations";

import useHooks from "./hooks";

const MyIntegrations: React.FC = () => {
  const { integrations, createLoading, handleIntegrationCreate, handleIntegrationNavigate } =
    useHooks();

  return (
    <MyIntegrationsWrapper
      integrations={integrations}
      onIntegrationNavigate={handleIntegrationNavigate}
      createLoading={createLoading}
      onIntegrationCreate={handleIntegrationCreate}
    />
  );
};

export default MyIntegrations;
