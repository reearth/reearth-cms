import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { useT } from "@reearth-cms/i18n";

const MyIntegrationHeader: React.FC = () => {
  const t = useT();

  return <IntegrationPageHeader title={t("My Integration")} />;
};

const IntegrationPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
`;
export default MyIntegrationHeader;
