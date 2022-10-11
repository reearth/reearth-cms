import { useMemo } from "react";

import { PublicScope } from "@reearth-cms/components/molecules/Accessibility";
import {
  //   useGetMeQuery,
  //   useUpdateProjectMutation,
  //   useUpdateModelMutation,
  useGetProjectsQuery,
} from "@reearth-cms/gql/graphql-client-api";

export default ({ projectId, workspaceId }: { projectId?: string; workspaceId?: string }) => {
  const { data } = useGetProjectsQuery({
    variables: { workspaceId: workspaceId ?? "", first: 100 },
    skip: !workspaceId,
  });

  const rawProject = useMemo(
    () => data?.projects.nodes.find((p: any) => p?.id === projectId),
    [data, projectId],
  );
  const project = useMemo(
    () =>
      rawProject?.id
        ? {
            id: rawProject.id,
            name: rawProject.name,
            description: rawProject.description,
            alias: rawProject.alias,
          }
        : undefined,
    [rawProject],
  );
  const projectScope: PublicScope = "limited";

  return { project, projectScope };
};
