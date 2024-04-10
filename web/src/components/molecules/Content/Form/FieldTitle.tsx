import styled from "@emotion/styled";

import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

type Props = {
  title: string;
  isUnique: boolean;
  isTitle: boolean;
};

const FieldTitle: React.FC<Props> = ({ title, isUnique, isTitle }) => {
  const t = useT();

  return (
    <Title>
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
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

const TagWrapper = styled.span`
  display: flex;
  align-items: center;
  padding-left: 5px;
`;

const ItemTitleTag = styled(Tag)`
  color: rgba(0, 0, 0, 0.45);
  background-color: #fafafa;
  margin: 0;
`;
