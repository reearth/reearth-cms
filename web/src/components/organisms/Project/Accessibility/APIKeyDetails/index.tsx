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
    initialValues,
    keyModels,
    updateLoading,
    regenerateLoading,
    handleAPIKeyCreate,
    handleAPIKeyUpdate,
    handleAPIKeyRegenerate,
  } = useHooks();

  return (
    <APIKeyDetailsMolecule
      apiUrl={apiUrl}
      hasPublishRight={hasPublishRight}
      currentProject={currentProject}
      currentKey={currentKey}
      initialValues={initialValues}
      keyModels={keyModels}
      keyId={keyId}
      createLoading={createLoading}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      onAPIKeyCreate={handleAPIKeyCreate}
      onAPIKeyUpdate={handleAPIKeyUpdate}
      onAPIKeyRegenerate={handleAPIKeyRegenerate}
    />
  );
};

export default APIKeyDetails;
