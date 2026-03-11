import styled from "@emotion/styled";

import Loading from "@reearth-cms/components/atoms/Loading";
import Pagination from "@reearth-cms/components/atoms/Pagination";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import ProjectCard from "@reearth-cms/components/molecules/ProjectList/ProjectCard";
import CreateProjectButton from "@reearth-cms/components/molecules/Workspace/CreateProjectButton";
import { ProjectListItem } from "@reearth-cms/components/molecules/Workspace/types";
import { useT, Trans } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  hasCreateRight: boolean;
  projects: ProjectListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onProjectNavigation: (projectId: string) => void;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
  onPageChange: (page: number, pageSize: number) => void;
};

const ProjectList: React.FC<Props> = ({
  hasCreateRight,
  projects,
  loading,
  page,
  pageSize,
  totalCount,
  onProjectNavigation,
  onProjectCreate,
  onProjectAliasCheck,
  onPageChange,
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
          <GridContainer>
            <ProjectCardWrapper>
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onProjectNavigation={onProjectNavigation}
                />
              ))}
              <SpaceHolder />
            </ProjectCardWrapper>
          </GridContainer>
          <ProjectPagination
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            align="end"
            current={page}
            total={totalCount}
            showSizeChanger
            showQuickJumper
            pageSize={pageSize}
          />
        </Content>
      )}
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled.div`
  margin-top: ${AntdToken.SPACING.BASE}px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProjectCardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  justify-content: space-between;
  gap: ${AntdToken.SPACING.LG}px;
  max-height: 350px;
  margin: 0 24px;
`;

const GridContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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
  gap: ${AntdToken.SPACING.BASE}px;
`;

const Suggestion = styled.p`
  margin-top: ${AntdToken.SPACING.XS}px;
  margin-bottom: ${AntdToken.SPACING.XS}px;
  font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
  font-size: ${AntdToken.FONT.SIZE}px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const Title = styled.h1`
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  line-height: ${AntdToken.LINE_HEIGHT.LG}px;
  color: ${AntdColor.GREY.GREY_8};
`;

const ProjectPagination = styled(Pagination)`
  box-shadow: 0 1px 0 0 ${AntdColor.NEUTRAL.BORDER_SECONDARY} inset;
  padding: ${AntdToken.SPACING.SM}px;
`;

// a space holder to prevent shadow of project card being blocked by parent element
const SpaceHolder = styled.div`
  height: 1px;
  grid-column: 1 / -1;
`;

export default ProjectList;
