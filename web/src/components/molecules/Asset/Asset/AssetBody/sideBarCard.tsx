import styled from "@emotion/styled";
import { ReactNode } from "react";

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
  box-shadow: 0 4px 4px 0 #00000025;
  background-color: #fff;
`;

const CardTitle = styled.span`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
`;

const CardValue = styled.span`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
`;

export default SideBarCard;
