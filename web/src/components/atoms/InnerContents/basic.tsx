import styled from "@emotion/styled";
import { Children, ReactNode } from "react";

import Content from "@reearth-cms/components/atoms/Content";

type Props = {
  title?: string;
  subtitle?: string;
  flexChildren?: boolean;
  children?: ReactNode;
};

const BasicInnerContents: React.FC<Props> = ({ title, subtitle, flexChildren, children }) => {
  const childrenArray = Children.toArray(children);
  return (
    <PaddedContent>
      {title && (
        <Header>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </Header>
      )}
      {childrenArray.map((child, idx) => (
        <Section key={idx} flex={flexChildren} lastChild={childrenArray.length - 1 === idx}>
          {child}
        </Section>
      ))}
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)`
  display: flex;
  flex-direction: column;
  margin: 16px;
`;

const Header = styled.div`
  background-color: #fff;
  padding: 24px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Subtitle = styled.p`
  margin: 16px 0 0 0;
  color: rgba(0, 0, 0, 0.45);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Section = styled.div<{ flex?: boolean; lastChild?: boolean }>`
  ${({ lastChild }) => !lastChild && "margin-bottom: 16px;"}
  ${({ flex }) => flex && "flex: 1;"}
`;

export default BasicInnerContents;
