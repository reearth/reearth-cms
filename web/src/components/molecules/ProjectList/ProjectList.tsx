import styled from "@emotion/styled";

import Loading from "@reearth-cms/components/atoms/Loading";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import ProjectCard from "@reearth-cms/components/molecules/ProjectList/ProjectCard";
import CreateProjectButton from "@reearth-cms/components/molecules/Workspace/CreateProjectButton";
import { ProjectListItem } from "@reearth-cms/components/molecules/Workspace/types";
import { useT, Trans } from "@reearth-cms/i18n";

type Props = {
  hasCreateRight: boolean;
  projects: ProjectListItem[];
  loading: boolean;
  onProjectNavigation: (projectId: string) => void;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const ProjectList: React.FC<Props> = ({
  hasCreateRight,
  projects,
  loading,
  onProjectNavigation,
  onProjectCreate,
  onProjectAliasCheck,
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
              onProjectCreate={onProjectCreate}
              onProjectAliasCheck={onProjectAliasCheck}
            />
          </Wrapper>
          <Suggestion>
            <Trans i18nKey="readDocument" components={{ l: <a role="link" href="" /> }} />
          </Suggestion>
        </EmptyListWrapper>
      ) : (
        <Content>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectNavigation={onProjectNavigation}
            />
          ))}
        </Content>
      )}
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled.div`
  margin-top: 16px;
  height: 100%;
  width: 100%;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  justify-content: space-between;
  gap: 24px;
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

export default ProjectList;
