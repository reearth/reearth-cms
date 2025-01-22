import { useCallback, useState } from "react";

import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationSettingsModal from "@reearth-cms/components/molecules/Integration/IntegrationSettingsModal";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";
import { IntegrationMember } from "@reearth-cms/components/molecules/Integration/types";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  loading: boolean;
  integrationMembers?: IntegrationMember[];
  onSearchTerm: (term?: string) => void;
  onReload: () => void;
  setSelectedIntegration: (integrationMember: IntegrationMember) => void;
  onIntegrationRemove: (integrationIds: string[]) => Promise<void>;
  deleteLoading: boolean;
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  hasConnectRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;

  myIntegrations?: Integration[];
  addLoading: boolean;
  onIntegrationConnect: (integration?: Integration) => Promise<void>;

  selectedIntegration?: IntegrationMember;
  updateLoading: boolean;
  onUpdateIntegration: (role: Role) => Promise<void>;
};

const IntegrationWrapper: React.FC<Props> = ({
  loading,
  integrationMembers,
  onSearchTerm,
  onReload,
  setSelectedIntegration,
  onIntegrationRemove,
  deleteLoading,
  page,
  pageSize,
  onTableChange,
  hasConnectRight,
  hasUpdateRight,
  hasDeleteRight,

  myIntegrations,
  addLoading,
  onIntegrationConnect,

  selectedIntegration,
  updateLoading,
  onUpdateIntegration,
}) => {
  const [integrationConnectModalShown, setIntegrationConnectModalShown] = useState(false);
  const handleIntegrationSettingsModalOpen = useCallback(
    (integrationMember: IntegrationMember) => {
      setSelectedIntegration(integrationMember);
      setIntegrationSettingsModalShown(true);
    },
    [setSelectedIntegration],
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
        integrations={myIntegrations}
        open={integrationConnectModalShown}
        loading={addLoading}
        onClose={handleIntegrationConnectModalClose}
        onSubmit={onIntegrationConnect}
      />
      <IntegrationSettingsModal
        selectedIntegration={selectedIntegration}
        open={integrationSettingsModalShown}
        loading={updateLoading}
        onClose={handleIntegrationSettingsModalClose}
        onSubmit={onUpdateIntegration}
      />
    </>
  );
};

export default IntegrationWrapper;
