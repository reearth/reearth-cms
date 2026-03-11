import styled from "@emotion/styled";
import { ReactNode } from "react";

import { AntdColor } from "@reearth-cms/utils/color";

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
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  border-radius: 2px;
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
`;

const CardTitle = styled.span`
  font-weight: 400;
  font-size: 13px;
  line-height: 22px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const CardValue = styled.span`
  font-weight: 400;
  font-size: 16px;
`;

export default SideBarCard;
