import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

const NotFound: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <Circle>404</Circle>
      <Content>
        <StyledTitle>{t("Oops!")}</StyledTitle>
        <StyledText>{t("ITEM NOT FOUND ON SERVER")}</StyledText>
        <Button href="/" type="primary">
          {t("Go back Home")}
        </Button>
      </Content>
    </Wrapper>
  );
};

export default NotFound;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: ${AntdColor.NEUTRAL.BG_WHITE};
`;

const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  color: ${AntdColor.GREY.GREY_0}; /* originally #BFBFBF */
  font-weight: ${AntdToken.FONT_WEIGHT.BOLD};
  background-color: ${AntdColor.NEUTRAL.BORDER};
  width: 240px;
  height: 240px;
  border-radius: 50%;
`;

const Content = styled.div`
  padding-top: 48px;
  text-align: center;
`;

const StyledTitle = styled.p`
  color: ${AntdColor.BLUE.BLUE_5}; /* originally #1890ff */
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  font-size: 38px;
  margin-bottom: ${AntdToken.SPACING.LG}px;
`;

const StyledText = styled.p`
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  margin-bottom: ${AntdToken.SPACING.LG}px;
`;
