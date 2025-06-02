import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    initialValues,
    models,
    hasPublishRight,
    updateLoading,
    regenerateLoading,
    apiUrl,
    alias,
    token,
    handleAPIKeyEdit,
    handlePublicUpdate,
    handleAPIKeyRegenerate,
    handleSettingsPageOpen,
  } = useHooks();

  return (
    <AccessibilityMolecule
      initialValues={initialValues}
      models={models}
      hasPublishRight={hasPublishRight}
      updateLoading={updateLoading}
      regenerateLoading={regenerateLoading}
      apiUrl={apiUrl}
      alias={alias}
      token={token}
      onAPIKeyEdit={handleAPIKeyEdit}
      onPublicUpdate={handlePublicUpdate}
      onAPIKeyRegenerate={handleAPIKeyRegenerate}
      onSettingsPageOpen={handleSettingsPageOpen}
    />
  );
};

export default Accessibility;
