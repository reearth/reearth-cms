import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    alias,
    apiKeys,
    apiUrl,
    handleAPIKeyDelete,
    handleAPIKeyEdit,
    handleAPIKeyNew,
    handlePublicUpdate,
    handleSettingsPageOpen,
    hasCreateRight,
    hasDeleteRight,
    hasPublishRight,
    hasUpdateRight,
    initialValues,
    isProjectPublic,
    models,
    updateLoading,
  } = useHooks();

  return (
    <AccessibilityMolecule
      alias={alias}
      apiKeys={apiKeys}
      apiUrl={apiUrl}
      hasCreateRight={hasCreateRight}
      hasDeleteRight={hasDeleteRight}
      hasPublishRight={hasPublishRight}
      hasUpdateRight={hasUpdateRight}
      initialValues={initialValues}
      isProjectPublic={isProjectPublic}
      models={models}
      onAPIKeyDelete={handleAPIKeyDelete}
      onAPIKeyEdit={handleAPIKeyEdit}
      onAPIKeyNew={handleAPIKeyNew}
      onPublicUpdate={handlePublicUpdate}
      onSettingsPageOpen={handleSettingsPageOpen}
      updateLoading={updateLoading}
    />
  );
};

export default Accessibility;
