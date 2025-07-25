import styled from "@emotion/styled";
import React from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Tag from "@reearth-cms/components/atoms/Tag";
import { ProjectListItem } from "@reearth-cms/components/molecules/Workspace/types";
import { ProjectVisibility } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Props = {
  project: ProjectListItem;
  onProjectNavigation: (projectId: string) => void;
};

const ProjectCard: React.FC<Props> = ({ project, onProjectNavigation }) => {
  const t = useT();
  const { Meta } = Card;

  return (
    <CardWrapper key={project.id}>
      <ProjectStyledCard onClick={() => onProjectNavigation(project.id)}>
        <Meta
          title={
            <TitleContainer>
              <ProjectName>{project.name}</ProjectName>
              <StyledTag
                bordered
                color={
                  project.accessibility?.visibility === ProjectVisibility.Public
                    ? "blue"
                    : "default"
                }>
                {project.accessibility?.visibility === ProjectVisibility.Public
                  ? t("Public")
                  : t("Private")}
              </StyledTag>
            </TitleContainer>
          }
          description={project.description}
        />
      </ProjectStyledCard>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  cursor: pointer;
  box-shadow: none;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow:
      0px 3px 6px -4px rgba(0, 0, 0, 0.12),
      0px 6px 16px rgba(0, 0, 0, 0.08),
      0px 9px 28px 8px rgba(0, 0, 0, 0.05);
  }
`;

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
`;

const ProjectName = styled.span`
  max-width: 130px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTag = styled(Tag)`
  margin: 0;
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
  .ant-card-meta-description {
    word-break: break-all;
  }
`;

export default ProjectCard;
