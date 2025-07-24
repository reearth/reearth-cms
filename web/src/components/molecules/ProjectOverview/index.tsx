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

import LicenseTab from "./LicenseTab";
import ModelsTab from "./ModelsTab";
import ReadmeTab from "./ReadmeTab";

type Props = {
  projectName?: string;
  projectDescription?: string;
  projectVisibility?: string;
  projectReadme?: string;
  projectLicense?: string;
  models?: Model[];
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onModelSearch: (value: string) => void;
  onModelModalOpen: () => void;
  onHomeNavigation: () => void;
  onSchemaNavigate: (modelId: string) => void;
  onContentNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
};

const ProjectOverview: React.FC<Props> = ({
  projectName,
  projectDescription,
  projectVisibility,
  projectReadme,
  projectLicense,
  models,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  onModelSearch,
  onModelModalOpen,
  onHomeNavigation,
  onSchemaNavigate,
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
}) => {
  const t = useT();
  const [activeKey, setActiveKey] = useState<string>("models");

  const [activeReadmeTab, setActiveReadmeTab] = useState("edit");
  const [readmeEditMode, setReadmeEditMode] = useState(false);
  const [readmeMarkdown, setReadmeMarkdown] = useState("");
  const [tempReadmeValue, setReadmeTempValue] = useState("");

  const [activeLicenseTab, setActiveLicenseTab] = useState("edit");
  const [licenseEditMode, setLicenseEditMode] = useState(false);
  const [licenseMarkdown, setLicenseMarkdown] = useState("");
  const [tempLicenseValue, setLicenseTempValue] = useState("");

  useEffect(() => {
    if (projectReadme) {
      setReadmeMarkdown(projectReadme);
    }
  }, [projectReadme]);

  useEffect(() => {
    if (readmeMarkdown) {
      setReadmeTempValue(readmeMarkdown);
    }
  }, [readmeMarkdown]);

  useEffect(() => {
    if (projectLicense) {
      setLicenseMarkdown(projectLicense);
    }
  }, [projectLicense]);

  useEffect(() => {
    if (licenseMarkdown) {
      setLicenseTempValue(licenseMarkdown);
    }
  }, [licenseMarkdown]);

  const handleReadmeSave = useCallback(() => {
    setReadmeMarkdown(tempReadmeValue);
    setActiveReadmeTab("edit");
    setReadmeEditMode(false);
  }, [tempReadmeValue]);

  const handleReadmeEdit = useCallback(() => {
    setReadmeEditMode(true);
  }, []);

  const handleLicenseSave = useCallback(() => {
    setLicenseMarkdown(tempLicenseValue);
    setActiveLicenseTab("edit");
    setLicenseEditMode(false);
  }, [tempLicenseValue]);

  const handleLicenseEdit = useCallback(() => {
    setLicenseEditMode(true);
  }, []);

  const handleReadmeMarkdownChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReadmeTempValue(e.target.value);
    setReadmeMarkdown(e.target.value);
  };

  const handleLicenseMarkdownChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLicenseTempValue(e.target.value);
    setLicenseMarkdown(e.target.value);
  };

  const handleChooseLicenseTemplate = useCallback(
    (value: string) => {
      setLicenseTempValue(value);
      setLicenseMarkdown(value);
    },
    [setLicenseTempValue],
  );

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
        {activeKey === "readme" ? (
          readmeEditMode ? (
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
          )
        ) : undefined}
        {activeKey === "license" ? (
          licenseEditMode ? (
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
          )
        ) : undefined}
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
          <div>
            <Button
              type="text"
              onClick={onHomeNavigation}
              style={{ color: "rgba(0, 0, 0, 0.45", fontSize: 20, fontWeight: "bold" }}>
              Home
            </Button>
            /<span style={{ padding: "0px 15px" }}>{projectName}</span>
          </div>
          <Tag bordered color={projectVisibility === ProjectVisibility.Public ? "blue" : "default"}>
            {projectVisibility === ProjectVisibility.Public ? t("Public") : t("Private")}
          </Tag>
        </Title>
      }
      subtitle={projectDescription}
      flexChildren>
      <StyledTabs
        activeKey={activeKey}
        tabBarExtraContent={tabBarExtraContent}
        onTabClick={key => setActiveKey(key)}>
        <Tabs.TabPane tab={t("Models")} key="models">
          <ModelsTab
            models={models}
            hasCreateRight={hasCreateRight}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
            onModelSearch={onModelSearch}
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
            markdown={readmeMarkdown}
            tempValue={tempReadmeValue}
            onMarkdownChange={handleReadmeMarkdownChange}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("License")} key="license">
          <LicenseTab
            activeTab={activeLicenseTab}
            editMode={licenseEditMode}
            setActiveTab={setActiveLicenseTab}
            markdown={licenseMarkdown}
            tempValue={tempLicenseValue}
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
  gap: 8px;
  align-items: center;
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
