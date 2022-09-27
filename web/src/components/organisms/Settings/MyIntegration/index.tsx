import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegration/IntegrationCreationModal";
import MyIntegrationList from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList";

const MyIntegration: React.FC = () => {
  return (
    <>
      <MyIntegrationList />
      <IntegrationCreationModal open={false} />
    </>
  );
};

export default MyIntegration;
