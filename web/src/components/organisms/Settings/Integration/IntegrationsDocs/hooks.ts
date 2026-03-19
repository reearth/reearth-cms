import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import { useWorkspace } from "@reearth-cms/state";

type OpenApiSpec = Record<string, unknown>;

export default () => {
  const [currentWorkspace] = useWorkspace();
  const [specContent, setSpecContent] = useState<OpenApiSpec>();

  const specUrl = `${window.REEARTH_CONFIG?.api}/openapi.json`;

  const workspaceId = useMemo<string>(
    () => currentWorkspace?.alias || currentWorkspace?.id || "",
    [currentWorkspace?.alias, currentWorkspace?.id],
  );

  useEffect(() => {
    if (!specUrl || !workspaceId) return;

    axios
      .get<OpenApiSpec>(specUrl)
      .then(({ data: spec }) => {
        const servers = spec?.servers as
          | { variables?: Record<string, { default?: string }> }[]
          | undefined;
        if (servers?.[0]?.variables?.workspaceIdOrAlias) {
          const updatedSpec = {
            ...spec,
            servers: [
              {
                ...servers[0],
                variables: {
                  ...servers[0].variables,
                  workspaceIdOrAlias: {
                    ...servers[0].variables.workspaceIdOrAlias,
                    default: workspaceId,
                  },
                },
              },
              ...servers.slice(1),
            ],
          };
          setSpecContent(updatedSpec);
        } else {
          setSpecContent(spec);
        }
      })
      .catch(_error => {
        setSpecContent(undefined);
      });
  }, [specUrl, workspaceId]);

  return {
    specContent,
    specUrl,
  };
};
