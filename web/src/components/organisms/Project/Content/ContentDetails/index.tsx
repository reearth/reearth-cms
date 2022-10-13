import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const { projectId, workspaceId, itemId, modelId } = useParams();
  const { currentModel, handleItemCreate, handleItemUpdate, initialFormValues } = useHooks({
    itemId,
  });
  const t = useT();

  const navigate = useNavigate();

  const handleNavigateToModel = useCallback(
    (modelId: string) => {
      navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const handleNavigateBack = useCallback(() => {
    navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}`);
  }, [navigate, workspaceId, projectId, modelId]);

  return (
    <ContentDetailsMolecule
      onBack={handleNavigateBack}
      itemId={itemId}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      initialFormValues={initialFormValues}
      model={currentModel}
      modelsMenu={<ModelsMenu title={t("Content")} selectModel={handleNavigateToModel} />}
    />
  );
};

export default ContentDetails;
