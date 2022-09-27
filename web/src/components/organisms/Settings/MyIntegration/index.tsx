import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegration/IntegrationCreationModal";
import MyIntegrationList from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList";

import useHooks from "./hooks";

const MyIntegration: React.FC = () => {
  const {
    integrations,
    integrationModalShown,
    handleIntegrationCreate,
    handleIntegrationModalOpen,
    handleIntegrationModalClose,
  } = useHooks();

  return (
    <>
      <MyIntegrationList
        integrations={integrations}
        onIntegrationModalOpen={handleIntegrationModalOpen}
      />
      <IntegrationCreationModal
        open={integrationModalShown}
        onClose={handleIntegrationModalClose}
        onSubmit={handleIntegrationCreate}
      />
    </>
  );
};

export default MyIntegration;
