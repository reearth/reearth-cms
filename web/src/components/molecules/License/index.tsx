import { ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { useT } from "@reearth-cms/i18n";

import LicenseTab from "../ProjectOverview/LicenseTab";
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
      <LicenseTab
        licenseValue={licenseValue}
        projectLicense={projectLicense}
        licenseEditMode={licenseEditMode}
        onLicenseMarkdownChange={onLicenseMarkdownChange}
        onChooseLicenseTemplate={onChooseLicenseTemplate}
      />
    </InnerContent>
  );
};

export default License;
