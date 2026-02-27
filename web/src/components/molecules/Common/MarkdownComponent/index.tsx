import styled from "@emotion/styled";
import { ChangeEventHandler, useMemo } from "react";
import ReactMarkdown from "react-markdown";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { getLicenseContent, license_options } from "@reearth-cms/data/license";
import { useT } from "@reearth-cms/i18n";

type Props = {
  activeTab?: string;
  needsTemplate?: boolean;
  onChooseLicenseTemplate?: (value: string) => void;
  onMarkdownChange?: ChangeEventHandler<HTMLTextAreaElement>;
  setActiveTab?: (key: string) => void;
  value?: string;
};

const MarkdownComponent: React.FC<Props> = ({
  activeTab,
  needsTemplate,
  onChooseLicenseTemplate,
  onMarkdownChange,
  setActiveTab,
  value,
}) => {
  const t = useT();

  const items: MenuProps["items"] = useMemo(() => {
    return license_options.map(option => ({
      key: option.value,
      label: option.label,
      onClick: () => {
        const value = getLicenseContent(option.value) ?? "";
        onChooseLicenseTemplate?.(value);
      },
    }));
  }, [onChooseLicenseTemplate]);

  const tabBarExtraContent = useMemo(() => {
    return needsTemplate ? (
      <Dropdown menu={{ items }} placement="bottomLeft" trigger={["click"]}>
        <Button icon={<Icon icon="copyright" />} type="link">
          {t("Choose a license template")}
        </Button>
      </Dropdown>
    ) : undefined;
  }, [items, needsTemplate, t]);

  return (
    <StyledTabs
      activeKey={activeTab}
      onChange={setActiveTab}
      tabBarExtraContent={tabBarExtraContent}>
      <Tabs.TabPane key="edit" tab="Edit">
        <TextArea
          onChange={onMarkdownChange}
          rows={30}
          style={{ fontFamily: "monospace" }}
          value={value}
        />
      </Tabs.TabPane>
      <Tabs.TabPane key="preview" tab="Preview">
        <StyledContainer>
          <ReactMarkdown>{value}</ReactMarkdown>
        </StyledContainer>
      </Tabs.TabPane>
    </StyledTabs>
  );
};

export default MarkdownComponent;

const StyledTabs = styled(Tabs)`
  background-color: #fafafa;
  border-left: 1px solid #f0f0f0;
  .ant-tabs-nav {
    margin-bottom: 0;
    padding: 0 20px;
    background-color: #fff;
  }
  .ant-tabs-content-holder {
    overflow-y: auto;
  }
`;

const StyledContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 700px;
  overflow-y: auto;
  font-family: inherit !important;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ul,
  ol,
  li,
  blockquote,
  table,
  thead,
  tbody,
  pre,
  code,
  tr,
  td,
  th,
  em,
  strong,
  a,
  del {
    font-family: inherit !important;
  }
`;
