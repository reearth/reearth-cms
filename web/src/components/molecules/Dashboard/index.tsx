import styled from "@emotion/styled";
import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Greeting from "@reearth-cms/components/molecules/Dashboard/Greeting";
import MoleculesProjectList from "@reearth-cms/components/molecules/Dashboard/MoleculesProjectList";
import { useT } from "@reearth-cms/i18n";

import { Project } from "./types";

export interface Props {
  projects: Project[];
  handleProjectSearch: (value: string) => void;
  handleProjectModalOpen: () => void;
  handleWorkspaceModalOpen?: () => void;
}

const Dashboard: React.FC<Props> = ({
  projects,
  handleProjectSearch,
  handleProjectModalOpen,
  handleWorkspaceModalOpen,
}) => {
  const t = useT();
  const { Search } = Input;
  const { workspaceId } = useParams();

  return (
    <PaddedContent>
      <Greeting />
      <ActionHeader>
        <Search
          onSearch={handleProjectSearch}
          placeholder={t("input search text")}
          allowClear
          type="text"
          style={{ width: 264 }}
        />
        <ButtonWrapper>
          <Button onClick={handleWorkspaceModalOpen}>{t("Create a Workspace")}</Button>
          <Button onClick={handleProjectModalOpen} type="primary" icon={<Icon icon="plus" />}>
            {t("New Project")}
          </Button>
        </ButtonWrapper>
      </ActionHeader>
      <MoleculesProjectList
        projects={projects}
        workspaceId={workspaceId}
        handleProjectModalOpen={handleProjectModalOpen}
      />
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
  min-height: 100%;
`;

const ActionHeader = styled(Content)`
  max-width: 1200px;
  margin: auto;
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

export default Dashboard;
