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
  gap: 4px;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
  background-color: #fff;
`;

const CardTitle = styled.span`
  font-weight: 400;
  font-size: 13px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
`;

const CardValue = styled.span`
  font-weight: 400;
  font-size: 16px;
`;

export default SideBarCard;
