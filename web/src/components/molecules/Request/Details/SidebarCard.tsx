import styled from "@emotion/styled";
import { ReactNode } from "react";

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
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
`;

const CardTitle = styled.h2`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
  overflow-x: hidden;
`;

const CardValue = styled.p`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
  overflow-x: hidden;
  margin-bottom: 4px;
`;

export default SidebarCard;
