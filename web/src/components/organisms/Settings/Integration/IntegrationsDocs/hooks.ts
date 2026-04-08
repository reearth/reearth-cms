import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import { useWorkspace } from "@reearth-cms/state";

import { OpenApiSpec, OpenApiSpecTransformer } from "./utils";

export default () => {
  const [currentWorkspace] = useWorkspace();
  const [specContent, setSpecContent] = useState<OpenApiSpec>();

  const apiBase = window.REEARTH_CONFIG?.api;
  const specUrl = apiBase ? `${apiBase}/openapi.json` : "";

  const workspaceId = useMemo<string>(
    () => currentWorkspace?.alias || currentWorkspace?.id || "",
    [currentWorkspace?.alias, currentWorkspace?.id],
  );

  useEffect(() => {
    if (!specUrl || !workspaceId) return;

    axios
      .get<OpenApiSpec>(specUrl)
      .then(({ data }) => {
        setSpecContent(
          OpenApiSpecTransformer.transformSpec(data, workspaceId, window.REEARTH_CONFIG?.api || ""),
        );
      })
      .catch(_error => {
        setSpecContent(undefined);
      });
  }, [specUrl, workspaceId]);

  return { specContent, specUrl };
};
