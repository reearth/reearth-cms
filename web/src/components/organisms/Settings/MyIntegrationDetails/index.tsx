import { useParams } from "react-router-dom";

import MyIntegrationContent from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationContent";

import useHooks from "./hooks";

const MyIntegrationDetails: React.FC = () => {
  const { integrationId } = useParams();
  const { selectedIntegration, handleIntegrationUpdate, handleWebhookCreate, handleWebhookDelete } =
    useHooks({
      integrationId,
    });

  return selectedIntegration ? (
    <MyIntegrationContent
      integration={selectedIntegration}
      onIntegrationUpdate={handleIntegrationUpdate}
      onWebhookCreate={handleWebhookCreate}
      onWebhookDelete={handleWebhookDelete}
    />
  ) : null;
};

export default MyIntegrationDetails;
