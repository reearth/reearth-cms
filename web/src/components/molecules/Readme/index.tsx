import styled from "@emotion/styled";
import { ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useT } from "@reearth-cms/i18n";

import MarkdownComponent from "../Common/MarkdownComponent";
import { UpdateProjectInput } from "../Workspace/types";

type Props = {
  readmeValue: string;
  projectReadme?: string;
  readmeEditMode: boolean;
  hasUpdateRight: boolean;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onReadmeSave: () => Promise<void>;
  onReadmeEdit: () => void;
  onReadmeMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

const Readme: React.FC<Props> = ({
  readmeValue,
  projectReadme,
  readmeEditMode,
  hasUpdateRight,
  onReadmeSave,
  onReadmeEdit,
  onReadmeMarkdownChange,
}) => {
  const t = useT();

  return (
    <InnerContent
      title={t("Readme")}
      flexChildren
      subtitle={t("README is a crucial document helping people quickly understand your project")}
      extra={
        readmeEditMode ? (
          <Button
            type="primary"
            icon={<Icon icon="save" />}
            onClick={onReadmeSave}
            disabled={!hasUpdateRight}>
            {t("Save Changes")}
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<Icon icon="edit" />}
            onClick={onReadmeEdit}
            disabled={!hasUpdateRight}>
            {t("Edit")}
          </Button>
        )
      }>
      <ContentSection>
        {readmeEditMode ? (
          <MarkdownComponent value={readmeValue} onMarkdownChange={onReadmeMarkdownChange} />
        ) : (
          <StyledContainer>
            <ReactMarkdown>{projectReadme}</ReactMarkdown>
          </StyledContainer>
        )}
      </ContentSection>
    </InnerContent>
  );
};

export default Readme;

const StyledContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 500px;
  overflow-y: auto;
`;
