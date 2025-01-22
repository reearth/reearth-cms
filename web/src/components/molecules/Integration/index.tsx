import { useCallback, useState } from "react";

import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";
import { IntegrationMember, Role } from "@reearth-cms/components/molecules/Integration/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  loading: boolean;
  integrationMembers?: IntegrationMember[];
  onSearchTerm: (term?: string) => void;
  onReload: () => void;
  setSelectedIntegrationMember: (integrationMember: IntegrationMember) => void;
  onIntegrationRemove: (integrationIds: string[]) => Promise<void>;
  deleteLoading: boolean;
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  hasConnectRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;

  integrations?: Integration[];
  addLoading: boolean;
  handleIntegrationConnect: (integration?: Integration) => Promise<void>;

  selectedIntegrationMember?: IntegrationMember;
  updateLoading: boolean;
  handleUpdateIntegration: (role: Role) => Promise<void>;
};

const IntegrationWrapper: React.FC<Props> = ({
  loading,
  integrationMembers,
  onSearchTerm,
  onReload,
  setSelectedIntegrationMember,
  onIntegrationRemove,
  deleteLoading,
  page,
  pageSize,
  onTableChange,
  hasConnectRight,
  hasUpdateRight,
  hasDeleteRight,

  integrations,
  addLoading,
  handleIntegrationConnect,

  selectedIntegrationMember,
  updateLoading,
  handleUpdateIntegration,
}) => {
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const handleIntegrationSettingsModalOpen = useCallback(
    (integrationMember: IntegrationMember) => {
      setSelectedIntegrationMember(integrationMember);
      setIntegrationSettingsModalShown(true);
    },
    [setSelectedIntegrationMember],
  );
  const handleIntegrationConnectModalClose = useCallback(() => {
    setIntegrationConnectModalShown(false);
  }, []);

  const [integrationSettingsModalShown, setIntegrationSettingsModalShown] = useState(false);
  const handleIntegrationConnectModalOpen = useCallback(() => {
    setIntegrationConnectModalShown(true);
  }, []);
  const handleIntegrationSettingsModalClose = useCallback(() => {
    setIntegrationSettingsModalShown(false);
  }, []);

  return (
    <>
      <IntegrationTable
        integrationMembers={integrationMembers}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={handleIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={handleIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />
      <IntegrationConnectModal
        integrations={integrations}
        open={integrationConnectModalShown}
        loading={addLoading}
        onClose={handleIntegrationConnectModalClose}
        onSubmit={handleIntegrationConnect}
      />
      <IntegrationSettingsModal
        selectedIntegrationMember={selectedIntegrationMember}
        open={integrationSettingsModalShown}
        loading={updateLoading}
        onClose={handleIntegrationSettingsModalClose}
        onSubmit={handleUpdateIntegration}
      />
    </>
  );
};

export default IntegrationWrapper;
