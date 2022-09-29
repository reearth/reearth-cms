import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegrations/IntegrationCreationModal";
import MyIntegrationsList from "@reearth-cms/components/molecules/MyIntegrations/MyIntegrationsList";

const MyIntegrations: React.FC = () => {
  return (
    <>
      <MyIntegrationsList />
      <IntegrationCreationModal open={false} />
    </>
  );
};

export default MyIntegrations;
