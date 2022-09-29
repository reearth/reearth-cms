import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";

export type Props = {
  title: string;
  onBack?: () => void;
};

const MyIntegrationHeader: React.FC<Props> = ({ title, onBack }) => {
  return <IntegrationPageHeader onBack={onBack} title={title} />;
};

const IntegrationPageHeader = styled(PageHeader)`
  background: #fff;
`;

export default MyIntegrationHeader;
