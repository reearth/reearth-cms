import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";

type Props = {
  documentUrl: string;
  playgroundUrl: string;
};

const APIDocLink: React.FC<Props> = ({ documentUrl, playgroundUrl }) => {
  const t = useT();

  return (
    <APIDocLinkWrapper>
      <Tooltip title={t("View full developer documentation")}>
        <a href={documentUrl} target="_blank" rel="noreferrer">
          <Button>
            <Icon icon="importOutlined" />
            {t("API Documentation")}
          </Button>
        </a>
      </Tooltip>
      <Tooltip title={t("Open API reference & playground")}>
        <a href={playgroundUrl} target="_blank" rel="noreferrer">
          <Button>{t("API Playground")}</Button>
        </a>
      </Tooltip>
    </APIDocLinkWrapper>
  );
};

export default APIDocLink;

const APIDocLinkWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
