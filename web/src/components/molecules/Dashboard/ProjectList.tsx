import styled from "@emotion/styled";
import React from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Typography from "@reearth-cms/components/atoms/Typography";
import ProjectCard from "@reearth-cms/components/molecules/Dashboard/ProjectCard";
import { Project as ProjectType } from "@reearth-cms/components/molecules/Dashboard/types";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  className?: string;
  projects?: ProjectType[];
  workspaceId?: string;
  handleProjectModalOpen: () => void;
}

const ProjectList: React.FC<Props> = ({
  className,
  projects,
  workspaceId,
  handleProjectModalOpen,
}) => {
  const t = useT();
  const { Title, Link } = Typography;

  return (
    <StyledDashboardBlock className={className}>
      {projects?.length ? (
        <Content>
          {projects.map((project: ProjectType) => (
            <ProjectCard key={project.id} project={project} workspaceId={workspaceId} />
          ))}
        </Content>
      ) : (
        <EmptyListWrapper>
          <Title level={5}>{t("No Projects Yet")}</Title>
          <Suggestion>
            {t("Create a new project")}{" "}
            <Button onClick={handleProjectModalOpen} type="primary" icon={<Icon icon="plus" />}>
              {t("New Project")}
            </Button>
          </Suggestion>
          <Suggestion>
            {t("Or read")} <Link href="">{t("how to use Re:Earth CMS")}</Link> {t("first")}
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
