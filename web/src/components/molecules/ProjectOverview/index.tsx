import styled from "@emotion/styled";
import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
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
  models?: Model[];
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
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
  models,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  onModelModalOpen,
  onHomeNavigation,
  onSchemaNavigate,
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
}) => {
  const t = useT();
  const [activeKey, setActiveKey] = useState<string>("models");

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
      <StyledTabs activeKey={activeKey} tabBarExtraContent={
        <div>
          {activeKey=== "models" && <Button>Add Model</Button>}
          {activeKey=== "readme" && <Button>Edit</Button>}
          {activeKey=== "license" && <Button>Edit</Button>}

        </div>
        } onTabClick={key => setActiveKey(key)}>
        <Tabs.TabPane tab={t("Models")} key="models">
          <ModelsTab
            models={models}
            hasCreateRight={hasCreateRight}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
            onModelModalOpen={onModelModalOpen}
            onSchemaNavigate={onSchemaNavigate}
            onContentNavigate={onContentNavigate}
            onModelDeletionModalOpen={onModelDeletionModalOpen}
            onModelUpdateModalOpen={onModelUpdateModalOpen}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("Readme")} key="readme">
          <ReadmeTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("License")} key="license">
          <LicenseTab />
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
