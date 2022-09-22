import styled from "@emotion/styled";
import React from "react";
import { useNavigate } from "react-router-dom";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Project } from "@reearth-cms/components/molecules/Workspace/types";

export interface Props {
  className?: string;
  project: Project;
  workspaceId?: string;
}

const ProjectCard: React.FC<Props> = ({ workspaceId, project }) => {
  const navigate = useNavigate();
  const { Meta } = Card;
  return (
    <CardWrapper key={project.id}>
      <ProjectStyledCard
        cover={<Cover>{project.name.charAt(0)}</Cover>}
        actions={[
          <Icon
            icon="settings"
            onClick={() => navigate("/workspaces/" + workspaceId + "/" + project.id)}
            key="setting"
          />,
          <Icon icon="edit" key="edit" />,
          <Icon icon="ellipsis" key="ellipsis" />,
        ]}>
        <Meta title={project.name} description={project.description} />
      </ProjectStyledCard>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  padding: 8px;
  flex: 0 0 25%;
  max-width: 25%;
  @media (max-width: 768px) {
    flex: 0 0 50%;
    max-width: 50%;
  }
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
`;

const ProjectStyledCard = styled(Card)`
  .ant-card-body {
    height: 118px;
  }
  .ant-card-meta-description {
    height: 44px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

export default ProjectCard;
