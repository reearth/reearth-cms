import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentList: React.FC = () => {
  const t = useT();

  const { currentModel, contentTableFields, contentTableColumns } = useHooks();

  const navigate = useNavigate();

  const { projectId, workspaceId, modelId } = useParams();

  const selectModel = useCallback(
    (modelId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/content/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const handleNavigateToItemForm = useCallback(() => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details`);
  }, [navigate, workspaceId, projectId, modelId]);

  const handleNavigateToItemEditForm = useCallback(
    (itemId: string) => {
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details/${itemId}`,
      );
    },
    [navigate, workspaceId, projectId, modelId],
  );

  return (
    <ContentListMolecule
      onItemEdit={handleNavigateToItemEditForm}
      onItemAdd={handleNavigateToItemForm}
      model={currentModel}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      modelsMenu={<ModelsMenu title={t("Content")} selectModel={selectModel} />}
    />
  );
};

export default ContentList;
