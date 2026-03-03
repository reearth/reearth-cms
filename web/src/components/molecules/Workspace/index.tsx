import styled from "@emotion/styled";

import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { FormValues as WorkspaceFormValues } from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import ProjectList from "@reearth-cms/components/molecules/ProjectList/ProjectList";
import CreateProjectButton from "@reearth-cms/components/molecules/Workspace/CreateProjectButton";
import CreateWorkspaceButton from "@reearth-cms/components/molecules/Workspace/CreateWorkspaceButton";
import Greeting from "@reearth-cms/components/molecules/Workspace/Greeting";
import { Project, SortBy } from "@reearth-cms/components/molecules/Workspace/types";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import WorkspaceHeader from "./WorkspaceHeader";

type Props = {
  coverImageUrl?: string;
  hasCreateRight: boolean;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onProjectNavigation: (projectId: string) => void;
  onProjectSearch: (value: string) => void;
  onProjectSort: (sort: SortBy) => void;
  onWorkspaceCreate: (values: WorkspaceFormValues) => Promise<void>;
  page: number;
  pageSize: number;
  privateProjectsAllowed?: boolean;
  projects: Project[];
  projectSort: SortBy;
  totalCount: number;
  username?: string;
};

const WorkspaceWrapper: React.FC<Props> = ({
  coverImageUrl,
  hasCreateRight,
  loading,
  onPageChange,
  onProjectAliasCheck,
  onProjectCreate,
  onProjectNavigation,
  onProjectSearch,
  onProjectSort,
  onWorkspaceCreate,
  page,
  pageSize,
  privateProjectsAllowed,
  projects,
  projectSort,
  totalCount,
  username,
}) => {
  const disableWorkspaceUi = parseConfigBoolean(window.REEARTH_CONFIG?.disableWorkspaceUi);

  return (
    <InnerContent isFullHeight>
      <Greeting coverImageUrl={coverImageUrl} username={username} />
      <ContentSection
        hasPadding={false}
        headerActions={
          <ButtonWrapper>
            {!disableWorkspaceUi && <CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />}
            <CreateProjectButton
              hasCreateRight={hasCreateRight}
              onProjectAliasCheck={onProjectAliasCheck}
              onProjectCreate={onProjectCreate}
              privateProjectsAllowed={privateProjectsAllowed}
            />
          </ButtonWrapper>
        }
        title="Projects">
        <WorkspaceHeader
          onProjectSearch={onProjectSearch}
          onProjectSort={onProjectSort}
          projectSort={projectSort}
        />
        <ProjectList
          hasCreateRight={hasCreateRight}
          loading={loading}
          onPageChange={onPageChange}
          onProjectAliasCheck={onProjectAliasCheck}
          onProjectCreate={onProjectCreate}
          onProjectNavigation={onProjectNavigation}
          page={page}
          pageSize={pageSize}
          projects={projects}
          totalCount={totalCount}
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
