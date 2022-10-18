import styled from "@emotion/styled";
import { Children, ReactNode } from "react";

import Content from "@reearth-cms/components/atoms/Content";

export type Props = {
  title?: string;
  children?: ReactNode;
};

const BasicInnerContents: React.FC<Props> = ({ title, children }) => {
  return (
    <PaddedContent>
      {title && (
        <Section>
          <Title>{title}</Title>
        </Section>
      )}

      {Children.toArray(children).map((child, idx) => (
        <Section key={idx}>{child}</Section>
      ))}
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
`;

const Title = styled.p`
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  margin: 0;
`;

const Section = styled.div`
  background-color: #fff;
  color: rgba(0, 0, 0, 0.85);
  padding: 22px 24px;
  margin-bottom: 16px;
`;

export default BasicInnerContents;
