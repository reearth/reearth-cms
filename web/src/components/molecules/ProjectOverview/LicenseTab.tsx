import styled from "@emotion/styled";
import { ChangeEventHandler } from "react";
import ReactMarkdown from "react-markdown";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";

import MarkdownComponent from "./MarkdownComponent";

type Props = {
  activeTab?: string;
  editMode: boolean;
  setActiveTab?: (key: string) => void;
  markdown?: string;
  tempValue?: string;
  onMarkdownChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onChooseLicenseTemplate?: (value: string) => void;
};

const LicenseTab: React.FC<Props> = ({
  activeTab,
  editMode,
  setActiveTab,
  markdown,
  tempValue,
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
          markdown={markdown}
          tempValue={tempValue}
          onMarkdownChange={onMarkdownChange}
          onChooseLicenseTemplate={onChooseLicenseTemplate}
        />
      ) : (
        <StyledContainer>
          <ReactMarkdown>{markdown}</ReactMarkdown>
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
  min-height: 400px;
`;
