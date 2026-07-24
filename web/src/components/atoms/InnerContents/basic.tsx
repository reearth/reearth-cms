import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { Children, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import Content from "@reearth-cms/components/atoms/Content";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

export type Tab = {
  key: string;
  label: ReactNode;
  children: ReactNode;
};

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  onBack?: () => void;
  flexChildren?: boolean;
  isFullHeight?: boolean;
  tabs?: Tab[];
  tabQueryParam?: string;
  children?: ReactNode;
};

const BasicInnerContents: React.FC<Props> = props => {
  return props.tabs?.length ? <Tabbed {...props} /> : <Untabbed {...props} />;
};

const Untabbed: React.FC<Props> = ({ children, ...layoutProps }) => (
  <Layout {...layoutProps}>{children}</Layout>
);

const Tabbed: React.FC<Props> = ({ tabs = [], tabQueryParam = "tab", ...layoutProps }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeKey = useMemo(() => {
    const param = searchParams.get(tabQueryParam);
    return tabs.some(tab => tab.key === param) ? (param as string) : tabs[0].key;
  }, [searchParams, tabQueryParam, tabs]);

  const handleTabChange = useCallback(
    (key: string) => {
      const next = new URLSearchParams(searchParams);
      next.set(tabQueryParam, key);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams, tabQueryParam],
  );

  const footer = (
    <Tabs
      activeKey={activeKey}
      onChange={handleTabChange}
      items={tabs.map(({ key, label }) => ({ key, label }))}
    />
  );

  return (
    <Layout {...layoutProps} footer={footer}>
      {tabs.find(tab => tab.key === activeKey)?.children}
    </Layout>
  );
};

type LayoutProps = Omit<Props, "tabs" | "tabQueryParam"> & { footer?: ReactNode };

const Layout: React.FC<LayoutProps> = ({
  title,
  subtitle,
  extra,
  onBack,
  flexChildren,
  isFullHeight = false,
  footer,
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
        footer={footer}
      />
      {childrenArray.map((child, idx) => (
        <Section key={idx} flex={flexChildren} lastChild={childrenArray.length - 1 === idx}>
          {child}
        </Section>
      ))}
    </PaddedContent>
  );
};

const PaddedContent = styled(Content, {
  shouldForwardProp: prop => prop !== "isFullHeight",
})<{ isFullHeight: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${AntdToken.SPACING.BASE}px;
  ${props => props.isFullHeight && "height: 100%;"}
`;

const Header = styled(PageHeader)`
  background-color: ${AntdColor.NEUTRAL.BG_WHITE} !important;
  padding: ${AntdToken.SPACING.LG}px;
  margin-bottom: ${AntdToken.SPACING.BASE}px;
`;

const Section = styled.div<{ flex?: boolean; lastChild?: boolean }>`
  ${({ lastChild }) => !lastChild && `margin-bottom: ${AntdToken.SPACING.BASE}px;`}
  ${({ flex, lastChild }) => (flex || lastChild) && "flex: 1; height: 100%;"}
`;

export default BasicInnerContents;
