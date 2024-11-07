import { useCallback, useState, useEffect, useMemo, useRef } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Notification from "@reearth-cms/components/atoms/Notification";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  useUpdateModelMutation,
  useGetModelsQuery,
  Model as GQLModel,
  ProjectPublicationScope,
  useUpdateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasPublishRight = useMemo(
    () => !!userRights?.project.publish,
    [userRights?.project.publish],
  );
  const [form] = Form.useForm<FormType>();
  const modelsState = Form.useWatch("models", form) ?? {};
  const assetState = !!Form.useWatch("assetPublic", form);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const { data: modelsData } = useGetModelsQuery({
    variables: {
      projectId: currentProject?.id ?? "",
      pagination: { first: 100 },
    },
    skip: !currentProject?.id,
  });

  const models = useMemo(
    () =>
      modelsData?.models.nodes
        ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
        .filter((model): model is Model => !!model) ?? [],
    [modelsData?.models.nodes],
  );

  const initialValues = useMemo(() => {
    const modelsObj: Record<string, boolean> = {};
    models?.forEach(model => {
      modelsObj[model.id] = !!model.public;
    });
    return {
      scope: currentProject?.scope,
      alias: currentProject?.alias,
      assetPublic: !!currentProject?.assetPublic,
      models: modelsObj,
    };
  }, [currentProject?.alias, currentProject?.assetPublic, currentProject?.scope, models]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const changedModels = useRef(new Map<string, boolean>());

  const handleValuesChange = useCallback(
    (changedValues: Partial<FormType>, values: FormType) => {
      if (changedValues?.models) {
        const modelId = Object.keys(changedValues.models)[0];
        if (changedModels.current.has(modelId)) {
          changedModels.current.delete(modelId);
        } else {
          changedModels.current.set(modelId, changedValues.models[modelId]);
        }
      }
      if (
        initialValues.scope === values.scope &&
        initialValues.assetPublic === values.assetPublic &&
        changedModels.current.size === 0
      ) {
        setIsSaveDisabled(true);
      } else {
        setIsSaveDisabled(false);
      }
    },
    [initialValues],
  );

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [updateModelMutation] = useUpdateModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handlePublicUpdate = useCallback(async () => {
    if (!currentProject?.id) return;
    setLoading(true);
    try {
      const { alias, scope, assetPublic } = form.getFieldsValue();
      if (initialValues.scope !== scope || initialValues.assetPublic !== assetPublic) {
        const projRes = await updateProjectMutation({
          variables: {
            alias,
            projectId: currentProject.id,
            publication: {
              scope:
                scope === "PUBLIC"
                  ? ProjectPublicationScope.Public
                  : ProjectPublicationScope.Private,
              assetPublic,
            },
          },
        });
        if (projRes.errors) {
          throw new Error();
        }
      }
      if (changedModels.current.size) {
        changedModels.current.forEach(async (value, modelId) => {
          const modelRes = await updateModelMutation({
            variables: { modelId, public: value },
          });
          if (modelRes.errors) {
            throw new Error();
          }
        });
      }
      Notification.success({
        message: t("Successfully updated publication settings!"),
      });
      changedModels.current.clear();
      setIsSaveDisabled(true);
    } catch (_) {
      Notification.error({ message: t("Failed to update publication settings.") });
      setIsSaveDisabled(false);
    } finally {
      setLoading(false);
    }
  }, [
    currentProject?.id,
    form,
    initialValues.assetPublic,
    initialValues.scope,
    t,
    updateModelMutation,
    updateProjectMutation,
  ]);

  const apiUrl = useMemo(
    () => `${window.REEARTH_CONFIG?.api}/p/${currentProject?.alias}/`,
    [currentProject?.alias],
  );

  return {
    form,
    models,
    modelsState,
    assetState,
    isSaveDisabled,
    hasPublishRight,
    loading,
    apiUrl,
    handleValuesChange,
    handlePublicUpdate,
  };
};
