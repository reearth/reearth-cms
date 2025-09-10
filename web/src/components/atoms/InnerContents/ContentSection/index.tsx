import styled from "@emotion/styled";
import { ReactNode } from "react";

type Props = {
  title?: string;
  danger?: boolean;
  headerActions?: ReactNode;
  children?: ReactNode;
  description?: string;
  hasPadding?: boolean;
};

const ContentSection: React.FC<Props> = ({
  title,
  headerActions,
  children,
  danger,
  description,
  hasPadding = true,
}) => {
  return (
    <Wrapper danger={danger}>
      {title && (
        <Header>
          <InnerHeader>
            <Title>{title}</Title>
            {headerActions}
          </InnerHeader>
          {description && <Description>{description}</Description>}
        </Header>
      )}
      <GridArea hasPadding={hasPadding}>{children}</GridArea>
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  padding: 10px 24px;
`;

const InnerHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 500;
  margin: 0 8px 0 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: #00000073;
  margin: 4px 0 0;
`;

const GridArea = styled.div<{ hasPadding: boolean }>`
  ${({ hasPadding }) => hasPadding && "padding: 24px;"}
  flex: 1;
  display: flex;
  flex-direction: column;
`;
