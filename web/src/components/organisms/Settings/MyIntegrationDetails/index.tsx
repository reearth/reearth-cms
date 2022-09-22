import { useParams } from "react-router-dom";

import MyIntegrationDetailsContent from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsContent";
import MyIntegrationDetailsHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsHeader";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const { integrationId, workspaceId } = useParams();
  const { selectedIntegration, handleIntegrationUpdate } = useHooks({
    integrationId,
  });

  return (
    <>
      <MyIntegrationDetailsHeader title={selectedIntegration?.name} workspaceId={workspaceId} />
      <MyIntegrationDetailsContent
        integration={selectedIntegration}
        handleIntegrationUpdate={handleIntegrationUpdate}
      />
    </>
  );
};

export default MyIntegrationDetails;
