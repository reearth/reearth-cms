import { useParams } from "react-router-dom";

import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";

import useHooks from "./hooks";

const Integration: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    integrations,
    handleIntegrationConnectModalClose,
    handleIntegrationConnectModalOpen,
    integrationConnectModalShown,
  } = useHooks(workspaceId);
  return (
    <>
      <IntegrationTable
        integrations={integrations}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
      />
      <IntegrationConnectModal
        integrations={integrations}
        open={integrationConnectModalShown}
        onClose={handleIntegrationConnectModalClose}
      />
      <IntegrationSettingsModal open={false} />
    </>
  );
};

export default Integration;
