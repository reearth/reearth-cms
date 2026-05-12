import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { AntdColor } from "@reearth-cms/utils/style";

type Props = {
  url: string;
};

const APIDocLink: React.FC<Props> = ({ url }) => {
  const t = useT();

  return (
    <Tooltip
      title={
        <>
          <span>{t("Open API reference & playground")}</span>
          <span>
            <span>&nbsp;(</span>
            {t("This function is currently experimental and remains somewhat unstable")}
            <span>)</span>
          </span>
        </>
      }>
      <Button
        href={url}
        target="_blank"
        rel="noreferrer"
        icon={<Icon icon="experimentOutlined" color={AntdColor.GOLD.GOLD_5} />}>
        {t("API Playground")}
      </Button>
    </Tooltip>
  );
};

export default APIDocLink;
