import Button from "@reearth-cms/components/atoms/Button";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
};

const APIDocLink: React.FC<Props> = ({ url }) => {
  const t = useT();

  return (
    <Tooltip title={t("Open API reference & playground")}>
      <Button href={url} target="_blank" rel="noreferrer">
        {t("API Playground")}
      </Button>
    </Tooltip>
  );
};

export default APIDocLink;
