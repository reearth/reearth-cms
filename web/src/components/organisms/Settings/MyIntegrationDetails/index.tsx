import { useParams } from "react-router-dom";

import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationContent";
import { Integration } from "@reearth-cms/components/molecules/MyIntegration/types";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const { integrationId } = useParams();
  const { selectedIntegration, handleIntegrationUpdate } = useHooks({
    integrationId,
  });

  return (
    <MyIntegrationContent
      integration={selectedIntegration as Integration}
      onIntegrationUpdate={handleIntegrationUpdate}
    />
  );
};

export default MyIntegrationDetails;
