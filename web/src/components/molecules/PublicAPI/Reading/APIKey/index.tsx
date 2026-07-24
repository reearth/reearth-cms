import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useT } from "@reearth-cms/i18n";
import { AntdColor } from "@reearth-cms/utils/style";

import type { APIKey } from "../../types";

import APIKeyTable from "./APIKeyTable";

type Props = {
  isPublic?: boolean;
  keys?: APIKey[];
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onAPIKeyNew: () => void;
  onAPIKeyEdit: (keyId?: string) => void;
  onAPIKeyDelete: (id: string) => Promise<void>;
  onSettingsPageOpen: () => void;
};

const APIKeyComponent: React.FC<Props> = ({
  isPublic,
  keys,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  onAPIKeyNew,
  onAPIKeyEdit,
  onAPIKeyDelete,
  onSettingsPageOpen,
}) => {
  const t = useT();

  return (
    <ContentSection
      title={t("API Key")}
      headerActions={
        <Button
          icon={<Icon icon="plus" />}
          disabled={isPublic || !hasCreateRight}
          onClick={onAPIKeyNew}>
          {t("New Key")}
        </Button>
      }>
      {isPublic ? (
        <Flex justify="center" align="center" vertical>
          <Header>{t("Please transfer your project to private to use the API key")}</Header>
          <Description>
            {t("Customize your API key to control the visibility of your models")}
          </Description>
          <Button type="primary" onClick={onSettingsPageOpen}>
            {t("Change project visibility")}
          </Button>
        </Flex>
      ) : (
        <APIKeyTable
          keys={keys}
          hasUpdateRight={hasUpdateRight}
          hasDeleteRight={hasDeleteRight}
          onAPIKeyDelete={onAPIKeyDelete}
          onAPIKeyEdit={onAPIKeyEdit}
        />
      )}
    </ContentSection>
  );
};

export default APIKeyComponent;

const Header = styled.h3`
  color: ${AntdColor.GREY.GREY_7}; /* originally #262626 */
  padding-bottom: 16px;
`;

const Description = styled.p`
  color: ${AntdColor.GREY.GREY_2};
  margin: 0;
  padding-bottom: 16px;
`;
