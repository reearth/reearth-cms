import IntegrationHeader from "@reearth-cms/components/molecules/Integration/IntegrationHeader";
import IntegrationTable from "@reearth-cms/components/molecules/Integration/IntegrationTable";

const Integration: React.FC = () => {
  return (
    <>
      <IntegrationHeader handleSave={() => {}}></IntegrationHeader>
      <IntegrationTable></IntegrationTable>
    </>
  );
};

export default Integration;
