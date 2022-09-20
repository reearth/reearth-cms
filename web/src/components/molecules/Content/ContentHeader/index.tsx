import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { useT } from "@reearth-cms/i18n";

type Props = {
  handleAdd?: () => void;
  title: string;
};

const ContentHeader: React.FC<Props> = ({ title, handleAdd }) => {
  const t = useT();

  return (
    <IntegrationPageHeader
      title={title}
      extra={
        handleAdd && (
          <Button type="primary" onClick={handleAdd} icon={<Icon icon="plus" />}>
            {t("New Item")}
          </Button>
        )
      }
    />
  );
};

const IntegrationPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #f0f0f0;
`;
export default ContentHeader;
