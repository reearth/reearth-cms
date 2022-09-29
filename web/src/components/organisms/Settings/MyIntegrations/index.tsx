import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegrations/CreationModal";
import MyIntegrationsList from "@reearth-cms/components/molecules/MyIntegrations/List";

const MyIntegrations: React.FC = () => {
  return (
    <>
      <MyIntegrationsList />
      <IntegrationCreationModal open={false} />
    </>
  );
};

export default MyIntegrations;
