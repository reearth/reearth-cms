import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import ProjectCard from "@reearth-cms/components/molecules/ProjectList/ProjectCard";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { useT, Trans } from "@reearth-cms/i18n";

type Props = {
  hasCreateRight: boolean;
  projects?: Project[];
  loading: boolean;
  onProjectModalOpen: () => void;
  onProjectNavigation: (project: Project) => void;
};

const ProjectList: React.FC<Props> = ({
  hasCreateRight,
  projects,
  loading,
  onProjectModalOpen,
  onProjectNavigation,
}) => {
  const t = useT();

  return (
    <StyledDashboardBlock>
      {loading || !projects ? (
        <Loading minHeight="400px" />
      ) : projects.length === 0 ? (
        <EmptyListWrapper>
          <Title>{t("No Projects Yet")}</Title>
          <Wrapper>
            <Suggestion>{t("Create a new project")}</Suggestion>
            <Button
              onClick={onProjectModalOpen}
              type="primary"
              icon={<Icon icon="plus" />}
              disabled={!hasCreateRight}>
              {t("New Project")}
            </Button>
          </Wrapper>
          <Suggestion>
            <Trans i18nKey="readDocument" components={{ l: <a href="" /> }} />
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
