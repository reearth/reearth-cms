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
  needsTemplate?: boolean;
  activeTab?: string;
  setActiveTab?: (key: string) => void;
  value?: string;
  onMarkdownChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onChooseLicenseTemplate?: (value: string) => void;
};

const MarkdownComponent: React.FC<Props> = ({
  needsTemplate,
  activeTab,
  setActiveTab,
  value,
  onMarkdownChange,
  onChooseLicenseTemplate,
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
        <Button type="link" icon={<Icon icon="copyright" />}>
          {t("Choose a license template")}
        </Button>
      </Dropdown>
    ) : undefined;
  }, [items, needsTemplate, t]);

  return (
    <StyledTabs
      activeKey={activeTab}
      tabBarExtraContent={tabBarExtraContent}
      onChange={setActiveTab}>
      <Tabs.TabPane tab="Edit" key="edit">
        <TextArea
          rows={20}
          value={value}
          onChange={onMarkdownChange}
          style={{ fontFamily: "monospace" }}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Preview" key="preview">
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
  height: 500px;
  overflow-y: auto;
`;
