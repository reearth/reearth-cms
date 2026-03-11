import styled from "@emotion/styled";
import { CSSProperties, ReactNode } from "react";

import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string | JSX.Element;
  toolbar?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
};

const Card: React.FC<Props> = ({ title, toolbar, children, style }) => {
  return (
    <CardWrapper style={style}>
      <CardHeader>
        <Title>{title}</Title>
        <Toolbar>{toolbar}</Toolbar>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  padding: 0;
  border: 1px solid ${AntdColor.NEUTRAL.BG_LAYOUT};
  margin-bottom: ${AntdToken.SPACING.LG}px;
`;

const CardHeader = styled.div`
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px 0 20px;
  font-size: ${AntdToken.FONT.SIZE_HEADING_3}px;
`;

const Title = styled.p`
  margin: 0;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  display: flex;
  gap: ${AntdToken.SPACING.BASE}px;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
`;

const CardBody = styled.div`
  padding: 10px;
  background-color: ${AntdColor.NEUTRAL.BG_LAYOUT};
  text-align: center;
`;

export default Card;
