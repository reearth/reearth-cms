import { useMemo } from "react";

import { useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();

  const specUrl = useMemo(() => {
    if (!currentWorkspace?.alias && !currentWorkspace?.id) return "";
    if (!currentProject?.alias && !currentProject?.id) return "";

    const workspaceIdentifier = currentWorkspace?.alias || currentWorkspace?.id;
    const projectIdentifier = currentProject?.alias || currentProject?.id;

    return `${window.REEARTH_CONFIG?.api}/p/${workspaceIdentifier}/${projectIdentifier}`;
  }, [currentWorkspace, currentProject]);

  return {
    specUrl,
  };
};
