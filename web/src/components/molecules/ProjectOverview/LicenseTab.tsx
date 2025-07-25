import styled from "@emotion/styled";
import { ChangeEventHandler } from "react";
import ReactMarkdown from "react-markdown";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";

import MarkdownComponent from "./MarkdownComponent";

type Props = {
  activeTab?: string;
  editMode: boolean;
  setActiveTab?: (key: string) => void;
  value?: string;
  projectLicense?: string;
  onMarkdownChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onChooseLicenseTemplate?: (value: string) => void;
};

const LicenseTab: React.FC<Props> = ({
  activeTab,
  editMode,
  setActiveTab,
  value,
  projectLicense,
  onMarkdownChange,
  onChooseLicenseTemplate,
}) => {
  return (
    <ContentSection>
      {editMode ? (
        <MarkdownComponent
          needsTemplate
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          value={value}
          onMarkdownChange={onMarkdownChange}
          onChooseLicenseTemplate={onChooseLicenseTemplate}
        />
      ) : (
        <StyledContainer>
          <ReactMarkdown>{projectLicense}</ReactMarkdown>
        </StyledContainer>
      )}
    </ContentSection>
  );
};

export default LicenseTab;

const StyledContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 500px;
  overflow-y: auto;
`;
