import { useState, useCallback } from "react";

import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegrations/CreationModal";
import type { FormValues } from "@reearth-cms/components/molecules/MyIntegrations/CreationModal";
import MyIntegrationList from "@reearth-cms/components/molecules/MyIntegrations/List";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  integrations: Integration[];
  onIntegrationNavigate: (integrationId: string) => void;
  createLoading: boolean;
  onIntegrationCreate: (values: FormValues) => Promise<void>;
};

const MyIntegrationsWrapper: React.FC<Props> = ({
  integrations,
  onIntegrationNavigate,
  createLoading,
  onIntegrationCreate,
}) => {
  const [isModalShown, setIsModalShown] = useState(false);
  const handleIntegrationModalClose = useCallback(() => {
    setIsModalShown(false);
  }, []);

  const handleIntegrationModalOpen = useCallback(() => setIsModalShown(true), []);

  return (
    <>
      <MyIntegrationList
        integrations={integrations}
        onIntegrationModalOpen={handleIntegrationModalOpen}
        onIntegrationNavigate={onIntegrationNavigate}
      />
      <IntegrationCreationModal
        open={isModalShown}
        loading={createLoading}
        onClose={handleIntegrationModalClose}
        onIntegrationCreate={onIntegrationCreate}
      />
    </>
  );
};

export default MyIntegrationsWrapper;
