import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ContentListMolecule from "@reearth-cms/components/molecules/Content/ContentListMolecule";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentList: React.FC = () => {
  const t = useT();

  const { currentModel, contentTableFields, contentTableColumns } = useHooks();

  const navigate = useNavigate();

  const { projectId, workspaceId } = useParams();

  const selectModel = useCallback(
    (modelId: string) => {
      navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  return (
    <ContentListMolecule
      modelName={currentModel?.name}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      modelsMenu={<ModelsMenu title={t("Content")} selectModel={selectModel} />}
    />
  );
};

export default ContentList;
