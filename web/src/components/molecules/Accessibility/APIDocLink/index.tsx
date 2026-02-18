import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

type Props = {
  currentLang: string;
};

const APIDocLink: React.FC<Props> = ({ currentLang }) => {
  const t = useT();

  return (
    <APIDocLinkWrapper>
      <Tooltip title={t("View full developer documentation")}>
        <a
          href={
            currentLang === "en"
              ? Constant.INTEGRATION_API_DOCS.en
              : Constant.INTEGRATION_API_DOCS.ja
          }
          target="_blank"
          rel="noreferrer">
          <Button>
            <Icon icon="importOutlined" />
            {t("API Documentation")}
          </Button>
        </a>
      </Tooltip>
      <Tooltip title={t("Open API reference & playground")}>
        <a href="./accessibility/docs" target="_blank" rel="noreferrer">
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
