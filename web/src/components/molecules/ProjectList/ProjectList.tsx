import styled from "@emotion/styled";

import Loading from "@reearth-cms/components/atoms/Loading";
import Pagination from "@reearth-cms/components/atoms/Pagination";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import ProjectCard from "@reearth-cms/components/molecules/ProjectList/ProjectCard";
import CreateProjectButton from "@reearth-cms/components/molecules/Workspace/CreateProjectButton";
import { ProjectListItem } from "@reearth-cms/components/molecules/Workspace/types";
import { Trans, useT } from "@reearth-cms/i18n";

type Props = {
  hasCreateRight: boolean;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onProjectNavigation: (projectId: string) => void;
  page: number;
  pageSize: number;
  projects: ProjectListItem[];
  totalCount: number;
};

const ProjectList: React.FC<Props> = ({
  hasCreateRight,
  loading,
  onPageChange,
  onProjectAliasCheck,
  onProjectCreate,
  onProjectNavigation,
  page,
  pageSize,
  projects,
  totalCount,
}) => {
  const t = useT();

  return (
    <StyledDashboardBlock>
      {loading ? (
        <Loading minHeight="400px" />
      ) : projects.length === 0 ? (
        <EmptyListWrapper>
          <Title>{t("No Projects Yet")}</Title>
          <Wrapper>
            <Suggestion>{t("Create a new project")}</Suggestion>
            <CreateProjectButton
              hasCreateRight={hasCreateRight}
              onProjectAliasCheck={onProjectAliasCheck}
              onProjectCreate={onProjectCreate}
            />
          </Wrapper>
          <Suggestion>
            <Trans components={{ l: <a href="" role="link" /> }} i18nKey="readDocument" />
          </Suggestion>
        </EmptyListWrapper>
      ) : (
        <Content>
          <GridContainer>
            <ProjectCardWrapper>
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  onProjectNavigation={onProjectNavigation}
                  project={project}
                />
              ))}
              <SpaceHolder />
            </ProjectCardWrapper>
          </GridContainer>
          <ProjectPagination
            align="end"
            current={page}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            pageSize={pageSize}
            showQuickJumper
            showSizeChanger
            total={totalCount}
          />
        </Content>
      )}
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled.div`
  margin-top: 16px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProjectCardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  justify-content: space-between;
  gap: 24px;
  max-height: 350px;
  margin: 0 24px;
`;

const GridContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const EmptyListWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Suggestion = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
`;

const ProjectPagination = styled(Pagination)`
  box-shadow: 0 1px 0 0 #f0f0f0 inset;
  padding: 12px;
`;

// a space holder to prevent shadow of project card being blocked by parent element
const SpaceHolder = styled.div`
  height: 1px;
  grid-column: 1 / -1;
`;

export default ProjectList;
