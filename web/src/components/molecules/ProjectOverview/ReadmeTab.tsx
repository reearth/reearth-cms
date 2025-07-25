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
  projectReadme?: string;
  onMarkdownChange?: ChangeEventHandler<HTMLTextAreaElement>;
};

const ReadmeTab: React.FC<Props> = ({
  activeTab,
  editMode,
  setActiveTab,
  value,
  projectReadme,
  onMarkdownChange,
}) => {
  return (
    <ContentSection>
      {editMode ? (
        <MarkdownComponent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          value={value}
          onMarkdownChange={onMarkdownChange}
        />
      ) : (
        <StyledContainer>
          <ReactMarkdown>{projectReadme}</ReactMarkdown>
        </StyledContainer>
      )}
    </ContentSection>
  );
};

export default ReadmeTab;

const StyledContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 500px;
  overflow-y: auto;
`;
