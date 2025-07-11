import { useState } from "react";
import ReactMarkdown from "react-markdown";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useT } from "@reearth-cms/i18n";

import MarkdownComponent from "./MarkdownComponent";

const LicenseTab = () => {
  const t = useT();
  const hasUpdateRight = true;
  const [editMode, setEditMode] = useState(false);
  const initialMarkdown = `# Digital City Project Introduction\n\nWelcome to the project!!\n\n### Models\nDescription...\n\n### Relationships\nDescription...\n\n### Schema Overview\nDescription...\n\n### Use Cases\n- [Case 1](#)\n- [Case 2](#)\n\n### Contact\nDescription...`;

  const [activeTab, setActiveTab] = useState("preview");
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [tempValue, setTempValue] = useState(markdown);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    setMarkdown(tempValue);
    setActiveTab("preview");
    setEditMode(false);
  };

  return (
    <ContentSection
      title={t("Readme")}
      headerActions={
        editMode ? (
          <Button
            type="primary"
            icon={<Icon icon="save" />}
            onClick={handleSave}
            disabled={!hasUpdateRight}>
            {t("Save Changes")}
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<Icon icon="edit" />}
            onClick={handleEdit}
            disabled={!hasUpdateRight}>
            {t("Edit")}
          </Button>
        )
      }>
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
