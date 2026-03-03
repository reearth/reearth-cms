import APIKeyDetailsMolecule from "@reearth-cms/components/molecules/Accessibility/APIKeyDetails";

import useHooks from "./hooks";

const APIKeyDetails: React.FC = () => {
  const {
    apiUrl,
    createLoading,
    currentKey,
    currentProject,
    handleAPIKeyCreate,
    handleAPIKeyRegenerate,
    handleAPIKeyUpdate,
    handleBack,
    hasCreateRight,
    hasPublishRight,
    hasUpdateRight,
    initialValues,
    isNewKey,
    keyId,
    keyModels,
    regenerateLoading,
    topRef,
    updateLoading,
  } = useHooks();

  return (
    <div ref={topRef}>
      <APIKeyDetailsMolecule
        apiUrl={apiUrl}
        createLoading={createLoading}
        currentKey={currentKey}
        currentProject={currentProject}
        hasCreateRight={hasCreateRight}
        hasPublishRight={hasPublishRight}
        hasUpdateRight={hasUpdateRight}
        initialValues={initialValues}
        isNewKey={isNewKey}
        keyId={keyId}
        keyModels={keyModels}
        onAPIKeyCreate={handleAPIKeyCreate}
        onAPIKeyRegenerate={handleAPIKeyRegenerate}
        onAPIKeyUpdate={handleAPIKeyUpdate}
        onBack={handleBack}
        regenerateLoading={regenerateLoading}
        updateLoading={updateLoading}
      />
    </div>
  );
};

export default APIKeyDetails;
