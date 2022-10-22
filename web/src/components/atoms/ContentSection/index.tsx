import styled from "@emotion/styled";
import { ReactNode } from "react";

export type Props = {
  title: string;
  danger?: boolean;
  extra?: ReactNode;
  children?: ReactNode;
};

const ContentSection: React.FC<Props> = ({ title, extra, children, danger }) => {
  return (
    <Wrapper danger={danger}>
      <Header>
        <Subtitle>{title}</Subtitle>
        {extra}
      </Header>
      <GridArea>{children}</GridArea>
    </Wrapper>
  );
};

export default ContentSection;

const Wrapper = styled.div<{ danger?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.85);
  ${({ danger }) => danger && "border: 1px solid #FF4D4F;"}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  align-items: center;
  padding: 10px 24px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const GridArea = styled.div`
  padding: 24px;
`;
