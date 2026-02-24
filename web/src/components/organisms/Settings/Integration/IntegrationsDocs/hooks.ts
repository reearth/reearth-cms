import { useMemo } from "react";

import { useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();

  const specUrl = useMemo<string>(() => {
    if (!currentWorkspace?.alias && !currentWorkspace?.id) return "";
    if (!currentProject?.alias && !currentProject?.id) return "";

    const workspaceIdentifier = currentWorkspace?.alias || currentWorkspace?.id;
    const projectIdentifier = currentProject?.alias || currentProject?.id;

    // TODO: wait for url of integration playground
    return `${window.REEARTH_CONFIG?.api}/api/${workspaceIdentifier}/project/${projectIdentifier}`;
  }, [currentProject?.alias, currentProject?.id, currentWorkspace?.alias, currentWorkspace?.id]);

  return {
    specUrl,
  };
};
