import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegration/IntegrationCreationModal";
import MyIntegrationHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationHeader";
import MyIntegrationList from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList";

import useHooks from "./hooks";

const MyIntegration: React.FC = () => {
  const { integrations } = useHooks();

  return (
    <>
      <MyIntegrationHeader />
      <MyIntegrationList integrations={integrations} />
      <IntegrationCreationModal open={false} />
    </>
  );
};

export default MyIntegration;
