import IntegrationConnectModal from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal";
import IntegrationHeader from "@reearth-cms/components/molecules/Integration/IntegrationHeader";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";

const Integration: React.FC = () => {
  return (
    <>
      <IntegrationHeader handleSave={() => {}} />
      <IntegrationTable />
      <IntegrationConnectModal open={true} />
    </>
  );
};

export default Integration;
