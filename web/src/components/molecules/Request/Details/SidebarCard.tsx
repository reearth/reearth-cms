import styled from "@emotion/styled";
import { ReactNode } from "react";

import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string;
  children?: ReactNode;
};

const SidebarCard: React.FC<Props> = ({ title, children }) => {
  return (
    <SideBarCardWrapper>
      <CardTitle>{title}</CardTitle>
      <CardValue>{children}</CardValue>
    </SideBarCardWrapper>
  );
};

const SideBarCardWrapper = styled.div`
  padding: ${AntdToken.SPACING.SM}px;
  margin-bottom: ${AntdToken.SPACING.XS}px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: ${AntdColor.NEUTRAL.BG_WHITE};
  border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  border-radius: ${AntdToken.RADIUS.XS}px;
`;

const CardTitle = styled.h2`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  margin-bottom: ${AntdToken.SPACING.XXS}px;
  overflow-x: hidden;
`;

const CardValue = styled.p`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  line-height: ${AntdToken.LINE_HEIGHT.LG}px;
  color: ${AntdColor.NEUTRAL.TEXT};
  overflow-x: hidden;
  margin-bottom: ${AntdToken.SPACING.XXS}px;
`;

export default SidebarCard;
