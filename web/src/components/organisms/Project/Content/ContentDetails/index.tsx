import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/ContentDetailsMolecule";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const { projectId, workspaceId, itemId, modelId } = useParams();
  const { currentModel, handleItemCreate, handleItemUpdate, initialFormValues, defaultFormValues } =
    useHooks({ itemId });
  const t = useT();

  const navigate = useNavigate();

  const selectModel = useCallback(
    (modelId: string) => {
      navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const handleNvigateBack = useCallback(() => {
    navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}`);
  }, [navigate, workspaceId, projectId, modelId]);

  return (
    <ContentDetailsMolecule
      onBack={handleNvigateBack}
      itemId={itemId}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      initialFormValues={initialFormValues}
      defaultFormValues={defaultFormValues}
      model={currentModel}
      modelsMenu={<ModelsMenu title={t("Content")} selectModel={selectModel} />}
    />
  );
};

export default ContentDetails;
