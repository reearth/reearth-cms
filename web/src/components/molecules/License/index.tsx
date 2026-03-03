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
  licenseEditMode: boolean;
  licenseValue: string;
  onChooseLicenseTemplate: (value: string) => void;
  onLicenseEdit: () => void;
  onLicenseMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onLicenseSave: () => Promise<void>;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  projectLicense?: string;
};

const License: React.FC<Props> = ({
  hasUpdateRight,
  licenseEditMode,
  licenseValue,
  onChooseLicenseTemplate,
  onLicenseEdit,
  onLicenseMarkdownChange,
  onLicenseSave,
  projectLicense,
}) => {
  const t = useT();

  return (
    <InnerContent
      extra={
        licenseEditMode ? (
          <Button
            disabled={!hasUpdateRight}
            icon={<Icon icon="save" />}
            onClick={onLicenseSave}
            type="primary">
            {t("Save Changes")}
          </Button>
        ) : (
          <Button
            disabled={!hasUpdateRight}
            icon={<Icon icon="edit" />}
            onClick={onLicenseEdit}
            type="primary">
            {t("Edit")}
          </Button>
        )
      }
      flexChildren
      subtitle={t("License defines whether others can legally use and share your project & data")}
      title={t("License")}>
      <ContentSection>
        {licenseEditMode ? (
          <MarkdownComponent
            needsTemplate
            onChooseLicenseTemplate={onChooseLicenseTemplate}
            onMarkdownChange={onLicenseMarkdownChange}
            value={licenseValue}
          />
        ) : (
          <StyledContainer>
            <ReactMarkdown>{projectLicense}</ReactMarkdown>
          </StyledContainer>
        )}
      </ContentSection>
    </InnerContent>
  );
};

export default License;

const StyledContainer = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 700px;
  overflow-y: auto;
  font-family: inherit !important;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ul,
  ol,
  li,
  blockquote,
  table,
  thead,
  tbody,
  pre,
  code,
  tr,
  td,
  th,
  em,
  strong,
  a,
  del {
    font-family: inherit !important;
  }
`;
