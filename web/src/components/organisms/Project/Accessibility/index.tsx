import { useParams } from "react-router-dom";

import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const { projectId } = useParams();
  // const { projectId, workspaceId } = useParams(); // Don't need workspace for this

  const { projectScope, models, handleAccessibilityUpdate } = useHooks({ projectId });

  return (
    <AccessibilityMolecule
      projectScope={projectScope}
      models={models}
      onAccessibilityUpdate={handleAccessibilityUpdate}
    />
  );
};

export default Accessibility;
