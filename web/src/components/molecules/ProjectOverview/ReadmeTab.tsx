import styled from "@emotion/styled";
import { ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";

import MarkdownComponent from "./MarkdownComponent";

type Props = {
  readmeValue: string;
  projectReadme?: string;
  readmeEditMode: boolean;
  onReadmeMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

const ReadmeTab: React.FC<Props> = ({
  readmeValue,
  projectReadme,
  readmeEditMode,
  onReadmeMarkdownChange,
}) => {
  return (
    <ContentSection>
      {readmeEditMode ? (
        <MarkdownComponent value={readmeValue} onMarkdownChange={onReadmeMarkdownChange} />
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
