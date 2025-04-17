import { useCallback, useState, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { FormType, PublicScope } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  usePublishModelsMutation,
  useGetModelsQuery,
  Model as GQLModel,
  ProjectPublicationScope,
  useUpdateProjectMutation,
  useRegeneratePublicApiTokenMutation,
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
  const [updateLoading, setUpdateLoading] = useState(false);
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

  const alias = useMemo(() => currentProject?.alias ?? "", [currentProject?.alias]);
  const token = useMemo(() => currentProject?.token ?? "", [currentProject?.token]);

  const initialValues = useMemo(() => {
    const modelsObj: Record<string, boolean> = {};
    models?.forEach(model => {
      modelsObj[model.id] = !!model.public;
    });
    return {
      scope: currentProject?.scope ?? "PRIVATE",
      alias,
      token,
      assetPublic: !!currentProject?.assetPublic,
      models: modelsObj,
    };
  }, [alias, currentProject?.assetPublic, currentProject?.scope, models, token]);

  const scopeConvert = useCallback((scope?: PublicScope) => {
    if (scope === "PUBLIC") {
      return ProjectPublicationScope.Public;
    } else if (scope === "LIMITED") {
      return ProjectPublicationScope.Limited;
    } else {
      return ProjectPublicationScope.Private;
    }
  }, []);

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [publishModelsMutation] = usePublishModelsMutation({
    refetchQueries: ["GetModels"],
  });

  const handlePublicUpdate = useCallback(
    async ({ scope, assetPublic }: FormType, models: { modelId: string; status: boolean }[]) => {
      if (!currentProject?.id) return;
      setUpdateLoading(true);
      try {
        if (initialValues.scope !== scope || initialValues.assetPublic !== assetPublic) {
          const projRes = await updateProjectMutation({
            variables: {
              projectId: currentProject.id,
              publication: {
                scope: scopeConvert(scope),
                assetPublic,
              },
            },
          });
          if (projRes.errors) {
            throw new Error();
          }
        }
        if (models.length) {
          const res = await publishModelsMutation({
            variables: {
              models,
            },
          });
          if (res.errors) {
            throw new Error();
          }
        }
        Notification.success({
          message: t("Successfully updated publication settings!"),
        });
      } catch (e) {
        Notification.error({ message: t("Failed to update publication settings.") });
        throw e;
      } finally {
        setUpdateLoading(false);
      }
    },
    [
      currentProject?.id,
      initialValues.assetPublic,
      initialValues.scope,
      publishModelsMutation,
      scopeConvert,
      t,
      updateProjectMutation,
    ],
  );

  const [regeneratePublicApiToken, { loading: regenerateLoading }] =
    useRegeneratePublicApiTokenMutation({
      refetchQueries: ["GetProject"],
    });

  const handleRegenerateToken = useCallback(async () => {
    if (!currentProject?.id) return;
    try {
      const result = await regeneratePublicApiToken({
        variables: {
          projectId: currentProject.id,
        },
      });
      if (result.errors) {
        throw new Error();
      } else {
        Notification.success({
          message: t("Public API Token has been re-generated!"),
        });
      }
    } catch (e) {
      console.error(e);
      Notification.error({
        message: t("The attempt to re-generate the Public API Token has failed."),
      });
    }
  }, [currentProject?.id, regeneratePublicApiToken, t]);

  const apiUrl = useMemo(
    () => `${window.REEARTH_CONFIG?.api}/p/${currentProject?.alias}/`,
    [currentProject?.alias],
  );

  return {
    initialValues,
    models,
    hasPublishRight,
    updateLoading,
    regenerateLoading,
    apiUrl,
    alias,
    token,
    handlePublicUpdate,
    handleRegenerateToken,
  };
};
