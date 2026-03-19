import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
};

const DocumentationLink: React.FC<Props> = ({ url }) => {
  const t = useT();

  return (
    <Tooltip title={t("View full developer documentation")}>
      <a href={url} target="_blank" rel="noreferrer">
        <Button>
          <Icon icon="importOutlined" />
          {t("API Documentation")}
        </Button>
      </a>
    </Tooltip>
  );
};

export default DocumentationLink;
