import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProjectCard from "@reearth-cms/components/molecules/ProjectList/ProjectCard";
import { Project as ProjectType } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  className?: string;
  projects?: ProjectType[];
  onProjectModalOpen: () => void;
  onProjectNavigation: (project: ProjectType, tab?: string) => void;
}

const ProjectList: React.FC<Props> = ({
  className,
  projects,
  onProjectModalOpen,
  onProjectNavigation,
}) => {
  const t = useT();

  return (
    <StyledDashboardBlock className={className}>
      {projects?.length ? (
        <Content>
          {projects.map((project: ProjectType) => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectNavigation={onProjectNavigation}
            />
          ))}
        </Content>
      ) : (
        <EmptyListWrapper>
          <Title>{t("No Projects Yet")}</Title>
          <Suggestion>
            {t("Create a new project")}{" "}
            <Button onClick={onProjectModalOpen} type="primary" icon={<Icon icon="plus" />}>
              {t("New Project")}
            </Button>
          </Suggestion>
          <Suggestion>
            {t("Or read")} <a href="">{t("how to use Re:Earth CMS")}</a> {t("first")}
          </Suggestion>
        </EmptyListWrapper>
      )}
    </StyledDashboardBlock>
  );
};

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

const EmptyListWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const StyledDashboardBlock = styled.div`
  height: 100%;
  width: 100%;
  @media only screen and (max-width: 1024px) {
    order: 4;
  }
`;

const Content = styled.div`
  height: 100%;
  margin: 0 -16px;
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: auto;
  justify-content: flex-start;
  align-content: flex-start;
`;

export default ProjectList;
