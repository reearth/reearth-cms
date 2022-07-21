import {
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Project as ProjectType } from "@reearth-cms/components/molecules/Dashboard/types";
import { Button, Card } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { Meta } = Card;
  return (
    <StyledDashboardBlock className={className}>
      {projects?.length ? (
        <Content>
          {projects.map((project) => (
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
          ))}
        </Content>
      ) : (
        <EmptyListWrapper>
          <Title>No Projects Yet</Title>
          <Suggestion>
            Create a new project{" "}
            <Button
              onClick={handleProjectModalOpen}
              type="primary"
              icon={<PlusOutlined />}
            >
              New Project
            </Button>
          </Suggestion>
          <Suggestion>
            Or read <a href="">how to use Re:Earth CMS</a> first
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
`;

const StyledDashboardBlock = styled.div`
  height: 100%;
  width: 100%;
  @media only screen and (max-width: 1024px) {
    order: 4;
  }
`;

const CardWrapper = styled.div`
  width: 300px;
  padding: 12px;
`;

const Content = styled.div`
  height: 100%;
  margin: 0 -12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
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

export default ProjectList;
