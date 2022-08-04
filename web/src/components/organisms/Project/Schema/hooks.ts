import { useCallback, useMemo, useState } from "react";

import { Model } from "@reearth-cms/components/molecules/Dashboard/types";
import { useGetModelsQuery } from "@reearth-cms/gql/graphql-client-api";

type Params = {
  projectId?: string;
};

export default ({ projectId }: Params) => {
  const [modelModalShown, setModelModalShown] = useState(false);

  const { data, refetch } = useGetModelsQuery({
    variables: { projectId: projectId ?? "", first: 100 },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return (data?.models.nodes ?? [])
      .map<Model | undefined>(model =>
        model
          ? {
              id: model.id,
              description: model.description,
              name: model.name,
              key: model.key,
            }
          : undefined,
      )
      .filter((model): model is Model => !!model);
  }, [data?.models.nodes]);

  console.log(data);

  const handleModelModalClose = useCallback(() => {
    setModelModalShown(false);
  }, []);

  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  return {
    models,
    modelModalShown,
    handleModelModalOpen,
    handleModelModalClose,
  };
};
