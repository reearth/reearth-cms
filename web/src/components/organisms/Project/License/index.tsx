import LicenseMolecule from "@reearth-cms/components/molecules/License";

import useHooks from "./hooks";

const License: React.FC = () => {
  const {
    licenseValue,
    projectLicense,
    licenseEditMode,
    hasUpdateRight,
    handleProjectUpdate,
    handleLicenseSave,
    handleLicenseEdit,
    handleLicenseMarkdownChange,
    handleChooseLicenseTemplate,
  } = useHooks();

  return (
    <LicenseMolecule
      licenseValue={licenseValue}
      projectLicense={projectLicense}
      licenseEditMode={licenseEditMode}
      hasUpdateRight={hasUpdateRight}
      onProjectUpdate={handleProjectUpdate}
      onLicenseSave={handleLicenseSave}
      onLicenseEdit={handleLicenseEdit}
      onLicenseMarkdownChange={handleLicenseMarkdownChange}
      onChooseLicenseTemplate={handleChooseLicenseTemplate}
    />
  );
};

export default License;
