import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";

export type Props = {
  title: string;
};

const MyIntegrationHeader: React.FC<Props> = ({ title }) => {
  return <IntegrationPageHeader onBack={undefined} title={title} />;
};

const IntegrationPageHeader = styled(PageHeader)`
  background: #fff;
`;
export default MyIntegrationHeader;
