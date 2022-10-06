import styled from "@emotion/styled";
import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Content from "@reearth-cms/components/atoms/Content";
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
    <PaddedContent>
      <StyledModelsMenu title={t("Content")} selectModel={selectModel} />
      <ContentChild>
        <ContentTableWrapper
          modelName={currentModel?.name}
          contentTableFields={contentTableFields}
          contentTableColumns={contentTableColumns}
        />
      </ContentChild>
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
  display: flex;
  min-height: 100%;
`;

const StyledModelsMenu = styled(ModelsMenu)`
  width: 200px;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

export default ContentList;
