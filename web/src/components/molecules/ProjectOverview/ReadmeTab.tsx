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
};

const ReadmeTab: React.FC<Props> = ({
  activeTab,
  editMode,
  setActiveTab,
  markdown,
  tempValue,
  onMarkdownChange,
}) => {
  return (
    <ContentSection>
      {editMode ? (
        <MarkdownComponent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          markdown={markdown}
          tempValue={tempValue}
          onMarkdownChange={onMarkdownChange}
        />
      ) : (
        <StyledContainer>
          <ReactMarkdown>{markdown}</ReactMarkdown>
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
  min-height: 400px;
`;
