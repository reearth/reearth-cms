import PublicMolecule from "@reearth-cms/components/molecules/Public";

import useHooks from "./hooks";

const Public: React.FC = () => {
  const { projectScope, models, handlePublicUpdate, alias, assetPublic } = useHooks();
  return (
    <PublicMolecule
      assetPublic={assetPublic}
      projectScope={projectScope}
      models={models}
      alias={alias}
      onPublicUpdate={handlePublicUpdate}
    />
  );
};

export default Public;
