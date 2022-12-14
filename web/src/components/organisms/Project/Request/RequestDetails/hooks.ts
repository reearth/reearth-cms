import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { Request } from "@reearth-cms/components/molecules/Request/types";
import { convertRequest } from "@reearth-cms/components/organisms/Project/Request/convertRequest";
import { useGetRequestsQuery, Request as GQLRequest } from "@reearth-cms/gql/graphql-client-api";
import { useProject } from "@reearth-cms/state";

export default () => {
  const [currentProject] = useProject();
  const { requestId } = useParams();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data } = useGetRequestsQuery({
    variables: {
      projectId: projectId ?? "",
    },
    skip: !projectId,
  });

  const currentRequest: Request | undefined = useMemo(
    () =>
      convertRequest(data?.requests.nodes.find(request => request?.id === requestId) as GQLRequest),
    [requestId, data?.requests.nodes],
  );

  return {
    currentRequest,
  };
};
