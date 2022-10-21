import PublicMolecule from "@reearth-cms/components/molecules/Public";

import useHooks from "./hooks";

const Public: React.FC = () => {
  const { projectScope, models, handlePublicUpdate } = useHooks();

  return (
    <PublicMolecule
      projectScope={projectScope}
      models={models}
      onPublicUpdate={handlePublicUpdate}
    />
  );
};

export default Public;
