import ReactMarkdown from "react-markdown";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";

import MarkdownComponent from "./MarkdownComponent";

type Props = {
  activeTab?: string;
  editMode: boolean;
  setActiveTab?: (key: string) => void;
  markdown?: string;
  tempValue?: string;
  setTempValue?: (value: string) => void;
};

const LicenseTab: React.FC<Props> = ({
  activeTab,
  editMode,
  setActiveTab,
  markdown,
  tempValue,
  setTempValue,
}) => {
  return (
    <ContentSection>
      {editMode ? (
        <MarkdownComponent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          markdown={markdown}
          tempValue={tempValue}
          setTempValue={setTempValue}
        />
      ) : (
        <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "4px" }}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </ContentSection>
  );
};

export default LicenseTab;
