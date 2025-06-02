import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    initialValues,
    models,
    hasPublishRight,
    updateLoading,
    apiUrl,
    alias,
    handleAPIKeyEdit,
    handlePublicUpdate,
    handleSettingsPageOpen,
  } = useHooks();

  return (
    <AccessibilityMolecule
      initialValues={initialValues}
      models={models}
      hasPublishRight={hasPublishRight}
      updateLoading={updateLoading}
      apiUrl={apiUrl}
      alias={alias}
      onAPIKeyEdit={handleAPIKeyEdit}
      onPublicUpdate={handlePublicUpdate}
      onSettingsPageOpen={handleSettingsPageOpen}
    />
  );
};

export default Accessibility;
