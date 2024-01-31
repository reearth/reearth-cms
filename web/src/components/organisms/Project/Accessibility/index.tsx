import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    projectScope,
    models,
    handlePublicUpdate,
    alias,
    isSaveDisabled,
    handleAliasChange,
    handleUpdatedAssetState,
    handleUpdatedModels,
    aliasState,
    assetState,
  } = useHooks();

  return (
    <AccessibilityMolecule
      projectScope={projectScope}
      models={models}
      alias={alias}
      handlePublicUpdate={handlePublicUpdate}
      isSaveDisabled={isSaveDisabled}
      handleAliasChange={handleAliasChange}
      handleUpdatedAssetState={handleUpdatedAssetState}
      handleUpdatedModels={handleUpdatedModels}
      aliasState={aliasState}
      assetState={assetState}
    />
  );
};

export default Accessibility;
