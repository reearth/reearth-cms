import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import ProjectCreationModal from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import Greeting from "@reearth-cms/components/molecules/Dashboard/Greeting";
import ProjectList from "@reearth-cms/components/molecules/Dashboard/ProjectList";
import { useT } from "@reearth-cms/i18n";

import useDashboardHooks from "../Dashboard/hooks";

import useHooks from "./hooks";

const Project: React.FC = () => {
  const t = useT();

  const { Search } = Input;

  const {
    projects,
    currentWorkspaceId,
    projectModalShown,
    handleProjectSearch,
    handleProjectCreate,
    handleProjectModalOpen,
    handleProjectModalClose,
    handleProjectSettingsNavigation,
  } = useHooks();

  const {
    handleWorkspaceCreate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
  } = useDashboardHooks({ workspaceId: currentWorkspaceId });

  return (
    <>
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
        <ProjectList
          projects={projects}
          onProjectModalOpen={handleProjectModalOpen}
          onProjectSettingsNavigation={handleProjectSettingsNavigation}
        />
      </PaddedContent>
      <ProjectCreationModal
        open={projectModalShown}
        onClose={handleProjectModalClose}
        onSubmit={handleProjectCreate}
      />
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
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

export default Project;
