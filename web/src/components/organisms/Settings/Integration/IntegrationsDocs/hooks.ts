import { useMemo } from "react";

import { useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentWorkspace] = useWorkspace();

  const specUrl = useMemo(() => {
    const base = `${window.REEARTH_CONFIG?.api}/openapi.json`;
    const params = new URLSearchParams();

    const workspaceId = currentWorkspace?.alias || currentWorkspace?.id;

    if (workspaceId) params.set("workspaceId", workspaceId);

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [currentWorkspace?.alias, currentWorkspace?.id]);

  return {
    specUrl,
  };
};
