import { useMemo } from "react";

import { useProject, useWorkspace } from "@reearth-cms/state";

type PublicApiUrlOptions = {
  trailingSlash?: boolean;
};

export default ({ trailingSlash = false }: PublicApiUrlOptions = {}): string => {
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();

  return useMemo<string>(() => {
    const workspaceIdentifier = currentWorkspace?.alias || currentWorkspace?.id;
    const projectIdentifier = currentProject?.alias || currentProject?.id;
    if (!workspaceIdentifier || !projectIdentifier) return "";

    const base = `${window.REEARTH_CONFIG?.api}/p/${workspaceIdentifier}/${projectIdentifier}`;
    return trailingSlash ? `${base}/` : base;
  }, [currentWorkspace, currentProject, trailingSlash]);
};
