import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    apiKeys,
    isProjectPublic,
    initialValues,
    models,
    hasPublishRight,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    updateLoading,
    apiUrl,
    alias,
    handleAPIKeyNew,
    handleAPIKeyEdit,
    handleAPIKeyDelete,
    handlePublicUpdate,
    handleSettingsPageOpen,
    currentLang,
  } = useHooks();

  return (
    <AccessibilityMolecule
      apiKeys={apiKeys}
      isProjectPublic={isProjectPublic}
      initialValues={initialValues}
      models={models}
      hasPublishRight={hasPublishRight}
      hasCreateRight={hasCreateRight}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      updateLoading={updateLoading}
      apiUrl={apiUrl}
      alias={alias}
      onAPIKeyNew={handleAPIKeyNew}
      onAPIKeyEdit={handleAPIKeyEdit}
      onAPIKeyDelete={handleAPIKeyDelete}
      onPublicUpdate={handlePublicUpdate}
      onSettingsPageOpen={handleSettingsPageOpen}
      currentLang={currentLang}
    />
  );
};

export default Accessibility;
