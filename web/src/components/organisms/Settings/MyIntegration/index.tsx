import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegration/IntegrationCreationModal";
import MyIntegrationHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationHeader";

const MyIntegration: React.FC = () => {
  return (
    <>
      <MyIntegrationHeader />
      <IntegrationCreationModal open={true} />
    </>
  );
};

export default MyIntegration;
