import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ContentTableWrapper from "@reearth-cms/components/molecules/Content/ContentTableWrapper";
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
    <ContentTableWrapper
      modelName={currentModel?.name}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}>
      <ModelsMenu title={t("Content")} selectModel={selectModel} />
    </ContentTableWrapper>
  );
};

export default ContentList;
