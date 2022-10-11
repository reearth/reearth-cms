import { useParams } from "react-router-dom";

import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const { projectId, workspaceId } = useParams();

  const { projectScope } = useHooks({ projectId, workspaceId });

  return <AccessibilityMolecule projectScope={projectScope} />;
};

export default Accessibility;
