import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { useT } from "@reearth-cms/i18n";

type Props = {
  handleConnect: () => void;
};

const IntegrationHeader: React.FC<Props> = ({ handleConnect }) => {
  const t = useT();

  return (
    <IntegrationPageHeader
      title={t("Integration")}
      extra={
        <Button type="primary" onClick={handleConnect} icon={<Icon icon="api" />}>
          {t("Connect Integration")}
        </Button>
      }
    />
  );
};

const IntegrationPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #f0f0f0;
`;
export default IntegrationHeader;
