import styled from "@emotion/styled";
import { Link } from "react-router-dom";

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

  console.log("currentLang", currentLang);

  return (
    <APIDocLinkWrapper>
      <Tooltip title={t("View full developer documentation")}>
        <Link
          to={
            currentLang === "en"
              ? Constant.INTEGRATION_API_DOCS.en
              : Constant.INTEGRATION_API_DOCS.ja
          }
          target="_blank">
          <Button>
            <Icon icon="importOutlined" />
            {t("API Documentation")}
          </Button>
        </Link>
      </Tooltip>
      <Tooltip title={t("Open API reference & playground")}>
        <Link to="./docs" target="_blank">
          <Button>{t("API Playground")}</Button>
        </Link>
      </Tooltip>
    </APIDocLinkWrapper>
  );
};

export default APIDocLink;

const APIDocLinkWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
