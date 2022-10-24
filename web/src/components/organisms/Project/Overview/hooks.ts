import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Model } from "@reearth-cms/components/molecules/ProjectOverview";
import useModelHooks from "@reearth-cms/components/organisms/Project/ModelsMenu/hooks";
import { useGetModelsQuery } from "@reearth-cms/gql/graphql-client-api";
import { useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const navigate = useNavigate();

  const {
    handleModelModalClose,
    handleModelModalOpen,
    modelModalShown,
    handleModelCreate,
    handleModelKeyCheck,
    isKeyAvailable,
  } = useModelHooks({
    projectId: currentProject?.id,
  });

  const { data } = useGetModelsQuery({
    variables: { projectId: currentProject?.id ?? "", first: 100 },
    skip: !currentProject?.id,
  });

  const models = useMemo(() => {
    return (data?.models.nodes ?? [])
      .map<Model | undefined>(model =>
        model
          ? {
              id: model.id,
              description: model.description,
              name: model.name,
            }
          : undefined,
      )
      .filter((model): model is Model => !!model);
  }, [data?.models.nodes]);

  const handleSchemaNavigation = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/schema/${modelId}`,
      );
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

  const handleContentNavigation = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}`,
      );
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

  return {
    currentProject,
    models,
    isKeyAvailable,
    modelModalShown,
    handleSchemaNavigation,
    handleContentNavigation,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelCreate,
  };
};
