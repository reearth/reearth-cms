import APIKeyDetailsMolecule from "@reearth-cms/components/molecules/Accessibility/APIKeyDetails";

import useHooks from "./hooks";

const APIKeyDetails: React.FC = () => {
  const {
    apiUrl,
    keyId,
    currentProject,
    currentKey,
    createLoading,
    hasPublishRight,
    hasCreateRight,
    hasUpdateRight,
    initialValues,
    keyModels,
    updateLoading,
    regenerateLoading,
    handleAPIKeyCreate,
    handleAPIKeyUpdate,
    handleAPIKeyRegenerate,
    handleBack,
  } = useHooks();

  return (
    <APIKeyDetailsMolecule
      apiUrl={apiUrl}
      currentProject={currentProject}
      currentKey={currentKey}
      hasCreateRight={hasCreateRight}
      hasUpdateRight={hasUpdateRight}
      hasPublishRight={hasPublishRight}
      initialValues={initialValues}
      keyModels={keyModels}
      keyId={keyId}
      createLoading={createLoading}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      onAPIKeyCreate={handleAPIKeyCreate}
      onAPIKeyUpdate={handleAPIKeyUpdate}
      onAPIKeyRegenerate={handleAPIKeyRegenerate}
      onBack={handleBack}
    />
  );
};

export default APIKeyDetails;
