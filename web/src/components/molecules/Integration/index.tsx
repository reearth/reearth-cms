import { useCallback, useState } from "react";

import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";
import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  addLoading: boolean;
  deleteLoading: boolean;
  hasConnectRight: boolean;
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  loading: boolean;
  myIntegrations?: Integration[];
  onIntegrationConnect: (integrationId: string) => Promise<void>;
  onIntegrationRemove: (integrationIds: string[]) => Promise<void>;
  onSearchTerm: (term?: string) => void;
  onTableChange: (page: number, pageSize: number) => void;
  onUpdateIntegration: (role: Role) => Promise<void>;
  page: number;
  pageSize: number;
  selectedIntegration?: WorkspaceIntegration;
  setSelectedIntegration: (integration: WorkspaceIntegration) => void;
  updateLoading: boolean;
  workspaceIntegrations?: WorkspaceIntegration[];
};

const IntegrationWrapper: React.FC<Props> = ({
  addLoading,
  deleteLoading,
  hasConnectRight,
  hasDeleteRight,
  hasUpdateRight,
  loading,
  myIntegrations,
  onIntegrationConnect,
  onIntegrationRemove,
  onSearchTerm,
  onTableChange,
  onUpdateIntegration,
  page,
  pageSize,
  selectedIntegration,
  setSelectedIntegration,
  updateLoading,
  workspaceIntegrations,
}) => {
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const handleIntegrationConnectModalOpen = useCallback(() => {
    setIntegrationConnectModalShown(true);
  }, []);
  const handleIntegrationConnectModalClose = useCallback(() => {
    setIntegrationConnectModalShown(false);
  }, []);

  const [integrationSettingsModalShown, setIntegrationSettingsModalShown] = useState(false);
  const handleIntegrationSettingsModalOpen = useCallback(
    (integrationMember: WorkspaceIntegration) => {
      setSelectedIntegration(integrationMember);
      setIntegrationSettingsModalShown(true);
    },
    [setSelectedIntegration],
  );
  const handleIntegrationSettingsModalClose = useCallback(() => {
    setIntegrationSettingsModalShown(false);
  }, []);

  return (
    <>
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={handleIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={workspaceIntegrations}
      />
      <IntegrationConnectModal
        integrations={myIntegrations}
        loading={addLoading}
        onClose={handleIntegrationConnectModalClose}
        onSubmit={onIntegrationConnect}
        open={integrationConnectModalShown}
      />
      <IntegrationSettingsModal
        loading={updateLoading}
        onClose={handleIntegrationSettingsModalClose}
        onSubmit={onUpdateIntegration}
        open={integrationSettingsModalShown}
        selectedIntegration={selectedIntegration}
      />
    </>
  );
};

export default IntegrationWrapper;
