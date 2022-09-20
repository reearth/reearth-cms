import styled from "@emotion/styled";
import { useParams, useNavigate } from "react-router-dom";

import Content from "@reearth-cms/components/atoms/Content";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

const ContentDetails: React.FC = () => {
  const t = useT();

  const navigate = useNavigate();

  const { projectId, workspaceId } = useParams();
  const selectModel = (modelId: string) => {
    navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}/details`);
  };

  return (
    <PaddedContent>
      <SchemaStyledMenu>
        <ModelsMenu title={t("Content")} selectModel={selectModel} />
      </SchemaStyledMenu>
      <ContentChild></ContentChild>
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
  display: flex;
`;

const SchemaStyledMenu = styled.div`
  width: 200px;
  max-width: 200px;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

export default ContentDetails;
