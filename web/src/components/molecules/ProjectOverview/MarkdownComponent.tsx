import styled from "@emotion/styled";
import { Tabs, Input } from "antd";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;

type Props = {
  activeTab?: string;
  setActiveTab?: (key: string) => void;
  markdown?: string;
  tempValue?: string;
  setTempValue?: (value: string) => void;
};

const MarkdownComponent: React.FC<Props> = ({ activeTab, setActiveTab, markdown, tempValue, setTempValue }) => {
  return (
    <StyledTabs activeKey={activeTab} onChange={setActiveTab}>
      <Tabs.TabPane tab="Edit" key="edit">
        <TextArea
          rows={20}
          value={tempValue}
          onChange={e => setTempValue?.(e.target.value)}
          style={{ fontFamily: "monospace" }}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Preview" key="preview">
        <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "4px" }}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
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