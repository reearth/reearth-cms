import IntegrationCreationModal from "@reearth-cms/components/molecules/MyIntegration/IntegrationCreationModal";
import MyIntegrationHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationHeader";
import MyIntegrationList from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList";

const MyIntegration: React.FC = () => {
  return (
    <>
      <MyIntegrationHeader />
      <MyIntegrationList />
      <IntegrationCreationModal open={false} />
    </>
  );
};

export default MyIntegration;
