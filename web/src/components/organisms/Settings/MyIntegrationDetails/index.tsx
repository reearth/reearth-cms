import MyIntegrationDetailsContent from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsContent";
import MyIntegrationDetailsHeader from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationDetails/MyIntegrationDetailsHeader";

const MyIntegrationDetails: React.FC = () => {
  return (
    <>
      <MyIntegrationDetailsHeader title="My Integration / Robot Red" />
      <MyIntegrationDetailsContent />
    </>
  );
};

export default MyIntegrationDetails;
