import styled from "@emotion/styled";

import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { FormValues as WorkspaceFormValues } from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import ProjectList from "@reearth-cms/components/molecules/ProjectList/ProjectList";
import Greeting from "@reearth-cms/components/molecules/Workspace/Greeting";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import WorkspaceHeader from "@reearth-cms/components/molecules/Workspace/WorkspaceHeader";

type Props = {
  coverImageUrl?: string;
  projects: Project[];
  loading: boolean;
  hasCreateRight: boolean;
  onProjectSearch: (value: string) => void;
  onProjectNavigation: (projectId: string) => void;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onWorkspaceCreate: (values: WorkspaceFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const WorkspaceWrapper: React.FC<Props> = ({
  coverImageUrl,
  projects,
  loading,
  hasCreateRight,
  onProjectSearch,
  onProjectNavigation,
  onWorkspaceCreate,
  onProjectCreate,
  onProjectAliasCheck,
}) => {
  return (
    <Wrapper>
      <Greeting coverImageUrl={coverImageUrl} />
      <Content>
        <WorkspaceHeader
          hasCreateRight={hasCreateRight}
          onWorkspaceCreate={onWorkspaceCreate}
          onProjectSearch={onProjectSearch}
          onProjectCreate={onProjectCreate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
        <ProjectList
          hasCreateRight={hasCreateRight}
          projects={projects}
          loading={loading}
          onProjectNavigation={onProjectNavigation}
          onProjectCreate={onProjectCreate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: #fff;
  margin: 16px;
  min-height: 100%;
`;

const Content = styled.div`
  padding: 32px;
`;

export default WorkspaceWrapper;
