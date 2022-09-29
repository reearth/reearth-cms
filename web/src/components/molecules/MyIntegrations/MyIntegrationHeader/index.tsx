import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";

export type Props = {
  backgroundColor?: string;
  title: string;
  onBack?: () => void;
};

const MyIntegrationHeader: React.FC<Props> = ({ title, backgroundColor, onBack }) => {
  return <IntegrationPageHeader onBack={onBack} title={title} backgroundColor={backgroundColor} />;
};

const IntegrationPageHeader = styled(PageHeader)<{ backgroundColor?: string }>`
  background: ${({ backgroundColor }) => backgroundColor || "unset"};
`;

export default MyIntegrationHeader;
