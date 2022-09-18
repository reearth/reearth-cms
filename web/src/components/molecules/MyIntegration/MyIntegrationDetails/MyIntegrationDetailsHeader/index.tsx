import PageHeader from "@reearth-cms/components/atoms/PageHeader";

export interface Props {
  title: string;
}

const MyIntegrationDetailsHeader: React.FC<Props> = ({ title }) => {
  return <PageHeader onBack={() => null} title={title} />;
};

export default MyIntegrationDetailsHeader;
