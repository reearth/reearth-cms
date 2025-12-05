import styled from "@emotion/styled";
import { Children, ReactNode } from "react";

import Content from "@reearth-cms/components/atoms/Content";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  onBack?: () => void;
  flexChildren?: boolean;
  isFullHeight?: boolean;
  children?: ReactNode;
};

const BasicInnerContents: React.FC<Props> = ({
  title,
  subtitle,
  extra,
  onBack,
  flexChildren,
  isFullHeight = false,
  children,
}) => {
  const childrenArray = Children.toArray(children);

  return (
    <PaddedContent isFullHeight={isFullHeight}>
      <Header
        title={title && <div role="heading">{title}</div>}
        subTitle={subtitle}
        extra={extra}
        onBack={onBack}
      />
      {childrenArray.map((child, idx) => (
        <Section key={idx} flex={flexChildren} lastChild={childrenArray.length - 1 === idx}>
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
