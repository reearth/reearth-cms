import styled from "@emotion/styled";
import { Children, ReactNode } from "react";

import Content from "@reearth-cms/components/atoms/Content";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  flexChildren?: boolean;
  children?: ReactNode;
};

const BasicInnerContents: React.FC<Props> = ({
  title,
  subtitle,
  onBack,
  flexChildren,
  children,
}) => {
  const childrenArray = Children.toArray(children);
  return (
    <PaddedContent>
      <Header title={title} subTitle={subtitle} onBack={onBack} />
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

const Header = styled(PageHeader)`
  background-color: #fff !important;
  padding: 24px;
  margin-bottom: 16px;
`;

const Section = styled.div<{ flex?: boolean; lastChild?: boolean }>`
  ${({ lastChild }) => !lastChild && "margin-bottom: 16px;"}
  ${({ flex }) => flex && "flex: 1;"}
`;

export default BasicInnerContents;
