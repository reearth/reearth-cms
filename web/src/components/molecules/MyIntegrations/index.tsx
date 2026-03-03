import { useCallback, useState } from "react";

import type { FormValues } from "@reearth-cms/components/molecules/MyIntegrations/CreationModal";

import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegrations/CreationModal";
import MyIntegrationList from "@reearth-cms/components/molecules/MyIntegrations/List";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  createLoading: boolean;
  integrations: Integration[];
  onIntegrationCreate: (values: FormValues) => Promise<void>;
  onIntegrationNavigate: (integrationId: string) => void;
};

const MyIntegrationsWrapper: React.FC<Props> = ({
  createLoading,
  integrations,
  onIntegrationCreate,
  onIntegrationNavigate,
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
        loading={createLoading}
        onClose={handleIntegrationModalClose}
        onIntegrationCreate={onIntegrationCreate}
        open={isModalShown}
      />
    </>
  );
};

export default MyIntegrationsWrapper;
