import styled from "@emotion/styled";

import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { FormValues as WorkspaceFormValues } from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import ProjectList from "@reearth-cms/components/molecules/ProjectList/ProjectList";
import CreateProjectButton from "@reearth-cms/components/molecules/Workspace/CreateProjectButton";
import CreateWorkspaceButton from "@reearth-cms/components/molecules/Workspace/CreateWorkspaceButton";
import Greeting from "@reearth-cms/components/molecules/Workspace/Greeting";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { SortProjectBy } from "@reearth-cms/components/organisms/Workspace/types";

import WorkspaceHeader from "./WorkspaceHeader";

type Props = {
  username?: string;
  isFreePlan?: boolean;
  coverImageUrl?: string;
  projects: Project[];
  loading: boolean;
  hasCreateRight: boolean;
  onProjectSearch: (value: string) => void;
  onProjectSort: (sort: SortProjectBy) => void;
  onProjectNavigation: (projectId: string) => void;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onWorkspaceCreate: (values: WorkspaceFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const WorkspaceWrapper: React.FC<Props> = ({
  username,
  isFreePlan,
  coverImageUrl,
  projects,
  loading,
  hasCreateRight,
  onProjectSearch,
  onProjectSort,
  onProjectNavigation,
  onWorkspaceCreate,
  onProjectCreate,
  onProjectAliasCheck,
}) => {
  const disableWorkspaceUI = window.REEARTH_CONFIG?.disableWorkspaceUI ?? false;

  return (
    <InnerContent>
      <Greeting username={username} coverImageUrl={coverImageUrl} />
      <ContentSection
        title="Projects"
        headerActions={
          <ButtonWrapper>
            {!disableWorkspaceUI && <CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />}
            <CreateProjectButton
              isFreePlan={isFreePlan}
              hasCreateRight={hasCreateRight}
              onProjectCreate={onProjectCreate}
              onProjectAliasCheck={onProjectAliasCheck}
            />
          </ButtonWrapper>
        }>
        <WorkspaceHeader onProjectSearch={onProjectSearch} onProjectSort={onProjectSort} />
        <ProjectList
          hasCreateRight={hasCreateRight}
          projects={projects}
          loading={loading}
          onProjectNavigation={onProjectNavigation}
          onProjectCreate={onProjectCreate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </ContentSection>
    </InnerContent>
  );
};

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

export default WorkspaceWrapper;
