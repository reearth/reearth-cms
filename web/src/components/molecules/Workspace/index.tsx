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

import WorkspaceHeader from "./WorkspaceHeader";

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
  const oss = false;

  return (
    <InnerContent>
      <Greeting coverImageUrl={coverImageUrl} />
      <ContentSection
        title="Projects"
        headerActions={
          <ButtonWrapper>
            {oss && <CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />}
            <CreateProjectButton
              hasCreateRight={hasCreateRight}
              onProjectCreate={onProjectCreate}
              onProjectAliasCheck={onProjectAliasCheck}
            />
          </ButtonWrapper>
        }>
        <WorkspaceHeader onProjectSearch={onProjectSearch} />
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
