import styled from "@emotion/styled";

import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string;
  isUnique: boolean;
  isTitle: boolean;
};

const FieldTitle: React.FC<Props> = ({ title, isUnique, isTitle }) => {
  const t = useT();

  return (
    <Title data-testid={DATA_TEST_ID.Content__Form__FieldTitle}>
      <Wrapper>
        {title}
        {isUnique ? <FieldUnique>({t("unique")})</FieldUnique> : ""}
      </Wrapper>
      {isTitle && (
        <TagWrapper>
          <ItemTitleTag>{t("Title")}</ItemTitleTag>
        </TagWrapper>
      )}
    </Title>
  );
};

export default FieldTitle;

const Title = styled.p`
  margin: 0;
  display: flex;
  justify-content: space-between;
  overflow: auto;
`;

const Wrapper = styled.span`
  overflow: auto;
`;

const FieldUnique = styled.span`
  margin-left: ${AntdToken.SPACING.XXS}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
`;

const TagWrapper = styled.span`
  display: flex;
  align-items: center;
  padding-left: 5px;
`;

const ItemTitleTag = styled(Tag)`
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  background-color: ${AntdColor.NEUTRAL.BG_ELEVATED};
  margin: 0;
`;
