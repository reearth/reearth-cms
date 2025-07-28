import styled from "@emotion/styled";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import Tag from "@reearth-cms/components/atoms/Tag";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ProjectVisibility } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import { Project, SortBy, UpdateProjectInput } from "../Workspace/types";

import LicenseTab from "./LicenseTab";
import ModelsTab from "./ModelsTab";
import ReadmeTab from "./ReadmeTab";

type Props = {
  project?: Project;
  models?: Model[];
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onModelSearch: (value: string) => void;
  onModelSort: (sort: SortBy) => void;
  onModelModalOpen: () => void;
  onHomeNavigation: () => void;
  onSchemaNavigate: (modelId: string) => void;
  onContentNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
};

type ActiveKey = "models" | "readme" | "license";

const ProjectOverview: React.FC<Props> = ({
  project,
  models,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  onProjectUpdate,
  onModelSearch,
  onModelSort,
  onModelModalOpen,
  onHomeNavigation,
  onSchemaNavigate,
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
}) => {
  const t = useT();
  const [activeKey, setActiveKey] = useState<ActiveKey>("models");

  const [activeReadmeTab, setActiveReadmeTab] = useState("edit");
  const [readmeEditMode, setReadmeEditMode] = useState(false);
  const [readmeValue, setReadmeValue] = useState("");

  const [activeLicenseTab, setActiveLicenseTab] = useState("edit");
  const [licenseEditMode, setLicenseEditMode] = useState(false);
  const [licenseValue, setLicenseValue] = useState("");

  useEffect(() => {
    if (project?.readme) {
      setReadmeValue(project.readme);
    }
  }, [project?.readme]);

  useEffect(() => {
    if (project?.license) {
      setLicenseValue(project.license);
    }
  }, [project?.license]);

  const handleReadmeSave = useCallback(async () => {
    if (!project?.id) return;
    setActiveReadmeTab("edit");
    setReadmeEditMode(false);
    await onProjectUpdate({
      projectId: project.id,
      readme: readmeValue,
    });
  }, [onProjectUpdate, project?.id, readmeValue]);

  const handleReadmeEdit = useCallback(() => {
    setReadmeEditMode(true);
  }, []);

  const handleLicenseSave = useCallback(async () => {
    if (!project?.id) return;
    setActiveLicenseTab("edit");
    setLicenseEditMode(false);
    await onProjectUpdate({
      projectId: project.id,
      license: licenseValue,
    });
  }, [onProjectUpdate, project?.id, licenseValue]);

  const handleLicenseEdit = useCallback(() => {
    setLicenseEditMode(true);
  }, []);

  const handleReadmeMarkdownChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setReadmeValue(e.target.value);
  }, []);

  const handleLicenseMarkdownChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setLicenseValue(e.target.value);
  }, []);

  const handleChooseLicenseTemplate = useCallback((value: string) => {
    setLicenseValue(value);
  }, []);

  const tabBarExtraContent = useMemo(
    () => (
      <div>
        {activeKey === "models" && (
          <Button
            type="primary"
            icon={<Icon icon="plus" />}
            onClick={onModelModalOpen}
            disabled={!hasCreateRight}>
            {t("New Model")}
          </Button>
        )}
        {activeKey === "readme" &&
          (readmeEditMode ? (
            <Button
              type="primary"
              icon={<Icon icon="save" />}
              onClick={handleReadmeSave}
              disabled={!hasUpdateRight}>
              {t("Save Changes")}
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Icon icon="edit" />}
              onClick={handleReadmeEdit}
              disabled={!hasUpdateRight}>
              {t("Edit")}
            </Button>
          ))}
        {activeKey === "license" &&
          (licenseEditMode ? (
            <Button
              type="primary"
              icon={<Icon icon="save" />}
              onClick={handleLicenseSave}
              disabled={!hasUpdateRight}>
              {t("Save Changes")}
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Icon icon="edit" />}
              onClick={handleLicenseEdit}
              disabled={!hasUpdateRight}>
              {t("Edit")}
            </Button>
          ))}
      </div>
    ),
    [
      activeKey,
      handleLicenseEdit,
      handleLicenseSave,
      handleReadmeEdit,
      handleReadmeSave,
      hasCreateRight,
      hasUpdateRight,
      licenseEditMode,
      onModelModalOpen,
      readmeEditMode,
      t,
    ],
  );

  return (
    <InnerContent
      title={
        <Title>
          <TitleContainer>
            <div>
              <HomeButton type="text" onClick={onHomeNavigation}>
                {t("Home")}
              </HomeButton>
              /<ProjectName>{project?.name}</ProjectName>
            </div>
            <Tag
              bordered
              color={
                project?.accessibility?.visibility === ProjectVisibility.Public ? "blue" : "default"
              }>
              {project?.accessibility?.visibility === ProjectVisibility.Public
                ? t("Public")
                : t("Private")}
            </Tag>
          </TitleContainer>
          <DescriptionContainer>{project?.description}</DescriptionContainer>
        </Title>
      }
      flexChildren>
      <StyledTabs
        activeKey={activeKey}
        tabBarExtraContent={tabBarExtraContent}
        onTabClick={key => setActiveKey(key as ActiveKey)}>
        <Tabs.TabPane tab={t("Models")} key="models">
          <ModelsTab
            models={models}
            hasCreateRight={hasCreateRight}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
            onModelSearch={onModelSearch}
            onModelSort={onModelSort}
            onModelModalOpen={onModelModalOpen}
            onSchemaNavigate={onSchemaNavigate}
            onContentNavigate={onContentNavigate}
            onModelDeletionModalOpen={onModelDeletionModalOpen}
            onModelUpdateModalOpen={onModelUpdateModalOpen}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("Readme")} key="readme">
          <ReadmeTab
            activeTab={activeReadmeTab}
            editMode={readmeEditMode}
            setActiveTab={setActiveReadmeTab}
            value={readmeValue}
            projectReadme={project?.readme}
            onMarkdownChange={handleReadmeMarkdownChange}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("License")} key="license">
          <LicenseTab
            activeTab={activeLicenseTab}
            editMode={licenseEditMode}
            setActiveTab={setActiveLicenseTab}
            value={licenseValue}
            projectLicense={project?.license}
            onMarkdownChange={handleLicenseMarkdownChange}
            onChooseLicenseTemplate={handleChooseLicenseTemplate}
          />
        </Tabs.TabPane>
      </StyledTabs>
    </InnerContent>
  );
};

export default ProjectOverview;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TitleContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DescriptionContainer = styled.span`
  color: var(--character-secondary-45, rgba(0, 0, 0, 0.45));
  font-size: 14px;
  padding: 0 15px;
`;

const HomeButton = styled(Button)`
  color: rgba(0, 0, 0, 0.45);
  font-size: 20px;
  font-weight: bold;
`;

const ProjectName = styled.span`
  padding: 0px 15px;
`;

const StyledTabs = styled(Tabs)`
  background-color: #fafafa;
  border-left: 1px solid #f0f0f0;
  .ant-tabs-nav {
    margin-bottom: 0;
    padding: 20px;
    background-color: #fff;
  }
  .ant-tabs-content-holder {
    overflow-y: auto;
  }
`;
