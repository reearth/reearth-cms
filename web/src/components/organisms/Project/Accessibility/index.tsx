import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    models,
    handlePublicUpdate,
    scope,
    alias,
    isSaveDisabled,
    handleAliasChange,
    handleUpdatedAssetState,
    handleUpdatedModels,
    aliasState,
    assetState,
    handleSetScope,
  } = useHooks();

  return (
    <AccessibilityMolecule
      models={models}
      alias={alias}
      handlePublicUpdate={handlePublicUpdate}
      scope={scope}
      isSaveDisabled={isSaveDisabled}
      handleAliasChange={handleAliasChange}
      handleUpdatedAssetState={handleUpdatedAssetState}
      handleUpdatedModels={handleUpdatedModels}
      aliasState={aliasState}
      assetState={assetState}
      handleSetScope={handleSetScope}
    />
  );
};

export default Accessibility;
