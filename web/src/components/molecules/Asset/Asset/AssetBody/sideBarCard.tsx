import styled from "@emotion/styled";
import { ReactNode } from "react";

import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string;
  children?: ReactNode;
};

const SideBarCard: React.FC<Props> = ({ title, children }) => {
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
  gap: ${AntdToken.SPACING.XXS}px;
  border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  border-radius: ${AntdToken.RADIUS.XS}px;
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
`;

const CardTitle = styled.span`
  font-weight: 400;
  font-size: 13px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const CardValue = styled.span`
  font-weight: 400;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
`;

export default SideBarCard;
