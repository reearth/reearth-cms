import LicenseMolecule from "@reearth-cms/components/molecules/License";

import useHooks from "./hooks";

const License: React.FC = () => {
  const {
    handleChooseLicenseTemplate,
    handleLicenseEdit,
    handleLicenseMarkdownChange,
    handleLicenseSave,
    handleProjectUpdate,
    hasUpdateRight,
    licenseEditMode,
    licenseValue,
    projectLicense,
  } = useHooks();

  return (
    <LicenseMolecule
      hasUpdateRight={hasUpdateRight}
      licenseEditMode={licenseEditMode}
      licenseValue={licenseValue}
      onChooseLicenseTemplate={handleChooseLicenseTemplate}
      onLicenseEdit={handleLicenseEdit}
      onLicenseMarkdownChange={handleLicenseMarkdownChange}
      onLicenseSave={handleLicenseSave}
      onProjectUpdate={handleProjectUpdate}
      projectLicense={projectLicense}
    />
  );
};

export default License;
