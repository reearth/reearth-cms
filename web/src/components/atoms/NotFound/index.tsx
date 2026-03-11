import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

const NotFound: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <CircleWrapper>
        <Circle>404</Circle>
      </CircleWrapper>
      <Content>
        <StyledTitle>{t("Oops!")}</StyledTitle>
        <StyledText>{t("PAGE NOT FOUND ON SERVER")}</StyledText>
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
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${AntdColor.NEUTRAL.BG_LAYOUT_V4};
`;

const CircleWrapper = styled.div`
  padding: ${AntdToken.SPACING.XL}px;
`;

const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  color: ${AntdColor.GREY.GREY_0}; /* originally #BFBFBF */
  font-weight: 700;
  background-color: ${AntdColor.NEUTRAL.BORDER};
  width: 240px;
  height: 240px;
  padding: 0;
  border-radius: 50%;
`;

const Content = styled.div`
  padding: ${AntdToken.SPACING.XL}px;
  text-align: center;
`;

const StyledTitle = styled.h1`
  text-align: center;
  color: ${AntdColor.BLUE.BLUE_5}; /* originally #1890ff */
  font-weight: 500;
  font-size: 38px;
  line-height: 46px;
  margin-bottom: ${AntdToken.SPACING.LG}px;
`;

const StyledText = styled.p`
  font-weight: 500;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  line-height: ${AntdToken.LINE_HEIGHT.LG}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  margin-bottom: ${AntdToken.SPACING.LG}px;
`;
