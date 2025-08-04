import styled from "@emotion/styled";
import { ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";

import MarkdownComponent from "./MarkdownComponent";

type Props = {
  licenseValue: string;
  projectLicense?: string;
  licenseEditMode: boolean;
  onLicenseMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChooseLicenseTemplate: (value: string) => void;
};

const LicenseTab: React.FC<Props> = ({
  licenseValue,
  projectLicense,
  licenseEditMode,
  onLicenseMarkdownChange,
  onChooseLicenseTemplate,
}) => {
  return (
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
