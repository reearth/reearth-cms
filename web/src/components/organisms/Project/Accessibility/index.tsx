import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    form,
    models,
    modelsState,
    assetState,
    isSaveDisabled,
    hasPublishRight,
    updateLoading,
    regenerateLoading,
    apiUrl,
    alias,
    token,
    handleValuesChange,
    handlePublicUpdate,
    handleRegenerateToken,
  } = useHooks();

  return (
    <AccessibilityMolecule
      form={form}
      models={models}
      modelsState={modelsState}
      assetState={assetState}
      isSaveDisabled={isSaveDisabled}
      hasPublishRight={hasPublishRight}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      apiUrl={apiUrl}
      alias={alias}
      token={token}
      onValuesChange={handleValuesChange}
      onPublicUpdate={handlePublicUpdate}
      onRegenerateToken={handleRegenerateToken}
    />
  );
};

export default Accessibility;
