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
  hasUpdateRight: boolean;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onReadmeEdit: () => void;
  onReadmeMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onReadmeSave: () => Promise<void>;
  projectReadme?: string;
  readmeEditMode: boolean;
  readmeValue: string;
};

const Readme: React.FC<Props> = ({
  hasUpdateRight,
  onReadmeEdit,
  onReadmeMarkdownChange,
  onReadmeSave,
  projectReadme,
  readmeEditMode,
  readmeValue,
}) => {
  const t = useT();

  return (
    <InnerContent
      extra={
        readmeEditMode ? (
          <Button
            disabled={!hasUpdateRight}
            icon={<Icon icon="save" />}
            onClick={onReadmeSave}
            type="primary">
            {t("Save Changes")}
          </Button>
        ) : (
          <Button
            disabled={!hasUpdateRight}
            icon={<Icon icon="edit" />}
            onClick={onReadmeEdit}
            type="primary">
            {t("Edit")}
          </Button>
        )
      }
      flexChildren
      subtitle={t("README is a crucial document helping people quickly understand your project")}
      title={t("Readme")}>
      <ContentSection>
        {readmeEditMode ? (
          <MarkdownComponent onMarkdownChange={onReadmeMarkdownChange} value={readmeValue} />
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
  height: 700px;
  overflow-y: auto;
`;
