import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Project as ProjectType } from "@reearth-cms/components/molecules/Dashboard/types";
import { Card } from "antd";
import React from "react";

export interface Props {
  className?: string;
  projects?: ProjectType[];
}

const ProjectList: React.FC<Props> = ({ className, projects }) => {
  const { Meta } = Card;
  return (
    <StyledDashboardBlock className={className}>
      {projects?.length ? (
        <Content>
          {projects.map((project) => (
            // <Project key={project.id} project={project} />
            <CardWrapper key={project.id}>
              <Card
                cover={<Cover>{project.name.charAt(0)}</Cover>}
                actions={[
                  <SettingOutlined key="setting" />,
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
        <h2>no project</h2>
      )}
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled.div`
  width: 100%;
  @media only screen and (max-width: 1024px) {
    order: 4;
  }
`;

const CardWrapper = styled.div`
  width: 300px;
  padding-left: 12px;
  padding-right: 12px;
`;

const Content = styled.div`
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
