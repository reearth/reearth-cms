import styled from "@emotion/styled";
import { Children, ReactNode } from "react";

import Content from "@reearth-cms/components/atoms/Content";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";

type Props = {
  children?: ReactNode;
  extra?: ReactNode;
  flexChildren?: boolean;
  isFullHeight?: boolean;
  onBack?: () => void;
  subtitle?: ReactNode;
  title?: ReactNode;
};

const BasicInnerContents: React.FC<Props> = ({
  children,
  extra,
  flexChildren,
  isFullHeight = false,
  onBack,
  subtitle,
  title,
}) => {
  const childrenArray = Children.toArray(children);

  return (
    <PaddedContent isFullHeight={isFullHeight}>
      <Header
        extra={extra}
        onBack={onBack}
        subTitle={subtitle}
        title={title && <div role="heading">{title}</div>}
      />
      {childrenArray.map((child, idx) => (
        <Section flex={flexChildren} key={idx} lastChild={childrenArray.length - 1 === idx}>
          {child}
        </Section>
      ))}
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)<{ isFullHeight: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 16px;
  ${props => props.isFullHeight && "height: 100%;"}
`;

const Header = styled(PageHeader)`
  background-color: #fff !important;
  padding: 24px;
  margin-bottom: 16px;
`;

const Section = styled.div<{ flex?: boolean; lastChild?: boolean }>`
  ${({ lastChild }) => !lastChild && "margin-bottom: 16px;"}
  ${({ flex, lastChild }) => (flex || lastChild) && "flex: 1;"}
`;

export default BasicInnerContents;
