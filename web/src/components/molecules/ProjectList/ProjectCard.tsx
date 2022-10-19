import styled from "@emotion/styled";
import React from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";

export interface Props {
  className?: string;
  project: Project;
  onProjectNavigation: (project: Project, tab?: string) => void;
}

const ProjectCard: React.FC<Props> = ({ className, project, onProjectNavigation }) => {
  const { Meta } = Card;

  return (
    <CardWrapper className={className} key={project.id}>
      <ProjectStyledCard
        cover={<Cover>{project.name.charAt(0)}</Cover>}
        actions={[
          <Icon
            icon="settings"
            onClick={() => onProjectNavigation(project, "settings")}
            key="setting"
          />,
          <Icon icon="edit" key="edit" onClick={() => onProjectNavigation(project)} />,
          // <Icon icon="ellipsis" key="ellipsis" />,
        ]}>
        <Meta title={project.name} description={project.description} />
      </ProjectStyledCard>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
`;

const Cover = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 38px;
  line-height: 46px;
  height: 150px;
  background-color: #eeeeee;
  color: #fff;
  user-select: none;
`;

const ProjectStyledCard = styled(Card)`
  .ant-card-body {
    height: 100px;
    padding: 24px;
  }
  .ant-card-actions {
    height: 40px;
    > li {
      margin: auto;
      font-size: 16px;
    }
  }
  .ant-card-meta-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

export default ProjectCard;
