import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import Card from "@reearth-cms/components/atoms/Card";
import { Project } from "@reearth-cms/components/molecules/Dashboard/types";
import React from "react";
import { useNavigate } from "react-router-dom";

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
      <Card
        cover={<Cover>{project.name.charAt(0)}</Cover>}
        actions={[
          <SettingOutlined
            onClick={() =>
              navigate("/workspaces/" + workspaceId + "/" + project.id)
            }
            key="setting"
          />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <Meta title={project.name} description={project.description} />
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  width: 300px;
  padding: 12px;
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

export default ProjectCard;
