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
  licenseValue: string;
  projectLicense?: string;
  licenseEditMode: boolean;
  hasUpdateRight: boolean;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onLicenseSave: () => Promise<void>;
  onLicenseEdit: () => void;
  onLicenseMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChooseLicenseTemplate: (value: string) => void;
};

const License: React.FC<Props> = ({
  licenseValue,
  projectLicense,
  licenseEditMode,
  hasUpdateRight,
  onLicenseSave,
  onLicenseEdit,
  onLicenseMarkdownChange,
  onChooseLicenseTemplate,
}) => {
  const t = useT();

  return (
    <InnerContent
      title={t("License")}
      flexChildren
      subtitle={t("License defines whether others can legally use and share your project & data")}
      extra={
        licenseEditMode ? (
          <Button
            type="primary"
            icon={<Icon icon="save" />}
            onClick={onLicenseSave}
            disabled={!hasUpdateRight}>
            {t("Save Changes")}
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<Icon icon="edit" />}
            onClick={onLicenseEdit}
            disabled={!hasUpdateRight}>
            {t("Edit")}
          </Button>
        )
      }>
      <ContentSection>
        {licenseEditMode ? (
          <MarkdownComponent
            needsTemplate
            value={licenseValue}
            onMarkdownChange={onLicenseMarkdownChange}
            onChooseLicenseTemplate={onChooseLicenseTemplate}
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
