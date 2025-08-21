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
  username?: string;
  privateProjectsAllowed?: boolean;
  coverImageUrl?: string;
  projects: Project[];
  loading: boolean;
  hasCreateRight: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onProjectSearch: (value: string) => void;
  onProjectSort: (sort: SortBy) => void;
  onProjectNavigation: (projectId: string) => void;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onWorkspaceCreate: (values: WorkspaceFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onPageChange: (page: number, pageSize: number) => void;
};

const WorkspaceWrapper: React.FC<Props> = ({
  username,
  privateProjectsAllowed,
  coverImageUrl,
  projects,
  loading,
  hasCreateRight,
  page,
  pageSize,
  totalCount,
  onProjectSearch,
  onProjectSort,
  onProjectNavigation,
  onWorkspaceCreate,
  onProjectCreate,
  onProjectAliasCheck,
  onPageChange,
}) => {
  const disableWorkspaceUi = parseConfigBoolean(window.REEARTH_CONFIG?.disableWorkspaceUi);

  return (
    <InnerContent isFullHeight={true}>
      <Greeting username={username} coverImageUrl={coverImageUrl} />
      <ContentSection
        title="Projects"
        headerActions={
          <ButtonWrapper>
            {!disableWorkspaceUi && <CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />}
            <CreateProjectButton
              privateProjectsAllowed={privateProjectsAllowed}
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
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onProjectNavigation={onProjectNavigation}
          onProjectCreate={onProjectCreate}
          onProjectAliasCheck={onProjectAliasCheck}
          onPageChange={onPageChange}
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
