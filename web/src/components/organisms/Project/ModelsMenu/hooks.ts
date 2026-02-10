import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Group, ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { fromGraphQLGroup } from "@reearth-cms/components/organisms/DataConverters/schema";
import {
  Model as GQLModel,
  Group as GQLGroup,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  CheckGroupKeyAvailabilityDocument,
  CreateGroupDocument,
  GetGroupsDocument,
  UpdateGroupsOrderDocument,
} from "@reearth-cms/gql/__generated__/group.generated";
import {
  CheckModelKeyAvailabilityDocument,
  CreateModelDocument,
  GetModelDocument,
  GetModelsDocument,
  UpdateModelsOrderDocument,
} from "@reearth-cms/gql/__generated__/model.generated";
import { useT } from "@reearth-cms/i18n";
import { useModel, useWorkspace, useProject, useUserRights } from "@reearth-cms/state";

type Params = {
  modelId?: string;
};

export default ({ modelId }: Params) => {
  const t = useT();
  const [, setCurrentModel] = useModel();
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.model.create, [userRights?.model.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.model.update, [userRights?.model.update]);

  const navigate = useNavigate();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);
  const [modelModalShown, setModelModalShown] = useState(false);

  const [CheckModelKeyAvailability] = useLazyQuery(CheckModelKeyAvailabilityDocument, {
    fetchPolicy: "no-cache",
  });

  const handleModelKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      const response = await CheckModelKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkModelKeyAvailability.available : false;
    },
    [projectId, CheckModelKeyAvailability],
  );

  const { data } = useQuery(GetModelsDocument, {
    variables: { projectId: projectId ?? "", pagination: { first: 100 } },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return data?.models.nodes
      ?.map<Model | undefined>(model => (model ? fromGraphQLModel(model as GQLModel) : undefined))
      .filter((model): model is Model => !!model);
  }, [data?.models.nodes]);

  const { data: modelData } = useQuery(GetModelDocument, {
    fetchPolicy: "cache-and-network",
    variables: { id: modelId ?? "" },
    skip: !modelId,
  });

  const model = useMemo<Model | undefined>(
    () => fromGraphQLModel(modelData?.node as GQLModel),
    [modelData?.node],
  );

  useEffect(() => {
    setCurrentModel(model ?? undefined);
  }, [model, setCurrentModel]);

  const [createNewModel] = useMutation(CreateModelDocument, {
    refetchQueries: ["GetModels"],
  });

  const handleModelCreate = useCallback(
    async (data: ModelFormValues) => {
      if (!projectId) return;
      const model = await createNewModel({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (model.error || !model.data?.createModel) {
        Notification.error({ title: t("Failed to create model.") });
        return;
      }
      Notification.success({ title: t("Successfully created model!") });
      setModelModalShown(false);
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${projectId}/schema/${model.data?.createModel.model.id}`,
      );
    },
    [currentWorkspace?.id, projectId, createNewModel, navigate, t],
  );

  const [updateModelsOrder] = useMutation(UpdateModelsOrderDocument, {
    refetchQueries: ["GetModels"],
  });

  const handleUpdateModelsOrder = useCallback(
    async (modelIds: string[]) => {
      if (modelIds.length === 0) return;
      const model = await updateModelsOrder({
        variables: {
          modelIds,
        },
      });
      if (model.error) {
        Notification.error({ title: t("Failed to update models order.") });
        return;
      }
      Notification.success({ title: t("Successfully updated models order!") });
    },
    [updateModelsOrder, t],
  );

  const handleModelModalClose = useCallback(() => setModelModalShown(false), []);
  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  // Group hooks
  const [groupModalShown, setGroupModalShown] = useState(false);

  const { data: groupData } = useQuery(GetGroupsDocument, {
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const groups = useMemo(() => {
    return groupData?.groups
      ?.map<Group | undefined>(group => (group ? fromGraphQLGroup(group as GQLGroup) : undefined))
      .filter((group): group is Group => !!group);
  }, [groupData?.groups]);

  const handleGroupModalClose = useCallback(() => setGroupModalShown(false), []);
  const handleGroupModalOpen = useCallback(() => setGroupModalShown(true), []);

  const [CheckGroupKeyAvailability] = useLazyQuery(CheckGroupKeyAvailabilityDocument, {
    fetchPolicy: "no-cache",
  });

  const handleGroupKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      const response = await CheckGroupKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkGroupKeyAvailability.available : false;
    },
    [projectId, CheckGroupKeyAvailability],
  );

  const [createNewGroup] = useMutation(CreateGroupDocument, {
    refetchQueries: ["GetGroups"],
  });

  const handleGroupCreate = useCallback(
    async (data: { name: string; description: string; key: string }) => {
      if (!projectId) return;
      const group = await createNewGroup({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (group.error || !group.data?.createGroup) {
        Notification.error({ title: t("Failed to create group.") });
        return;
      }
      Notification.success({ title: t("Successfully created group!") });
      setGroupModalShown(false);
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${projectId}/schema/${group.data?.createGroup.group.id}`,
      );
    },
    [currentWorkspace?.id, projectId, createNewGroup, navigate, t],
  );

  const [updateGroupsOrder] = useMutation(UpdateGroupsOrderDocument, {
    refetchQueries: ["GetGroups"],
  });

  const handleUpdateGroupsOrder = useCallback(
    async (groupIds: string[]) => {
      const group = await updateGroupsOrder({
        variables: {
          groupIds,
        },
      });
      if (group.error) {
        Notification.error({ title: t("Failed to update groups order.") });
        return;
      }
      Notification.success({ title: t("Successfully updated groups order!") });
    },
    [updateGroupsOrder, t],
  );

  return {
    models,
    groups,
    modelModalShown,
    groupModalShown,
    hasCreateRight,
    hasUpdateRight,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelCreate,
    handleModelKeyCheck,
    handleGroupModalOpen,
    handleGroupModalClose,
    handleGroupCreate,
    handleGroupKeyCheck,
    handleUpdateModelsOrder,
    handleUpdateGroupsOrder,
  };
};
