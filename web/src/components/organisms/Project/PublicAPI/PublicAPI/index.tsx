import PublicAPIMolecule from "@reearth-cms/components/molecules/PublicAPI";

import useHooks from "./hooks";

const PublicAPI: React.FC = () => {
  const {
    apiKeys,
    isProjectPublic,
    initialValues,
    models,
    hasPublishRight,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    hasPostingRight,
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
    <PublicAPIMolecule
      apiKeys={apiKeys}
      isProjectPublic={isProjectPublic}
      initialValues={initialValues}
      models={models}
      hasPublishRight={hasPublishRight}
      hasCreateRight={hasCreateRight}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      hasPostingRight={hasPostingRight}
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

export default PublicAPI;
