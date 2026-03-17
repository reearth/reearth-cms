import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { useT, Trans } from "@reearth-cms/i18n";

import { SortBy, UpdateProjectInput } from "../Workspace/types";

import ModelCard from "./ModelCard";
import ProjectHeader from "./ProjectHeader";

type Props = {
  models?: Model[];
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  hasSchemaCreateRight: boolean;
  hasContentCreateRight: boolean;
  exportLoading?: boolean;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onModelSearch: (value: string) => void;
  onModelSort: (sort: SortBy) => void;
  onModelModalOpen: () => void;
  onHomeNavigation: () => void;
  onSchemaNavigate: (modelId: string) => void;
  onImportSchemaNavigate: (modelId: string) => void;
  onContentNavigate: (modelId: string) => void;
  onImportContentNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
  onModelExport: (modelId?: string, format?: ExportFormat) => Promise<void>;
};

const ProjectOverview: React.FC<Props> = ({
  models,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  hasSchemaCreateRight,
  hasContentCreateRight,
  exportLoading,
  onModelSearch,
  onModelSort,
  onModelModalOpen,
  onSchemaNavigate,
  onImportSchemaNavigate,
  onContentNavigate,
  onImportContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
  onModelExport,
}) => {
  const t = useT();

  return (
    <InnerContent
      title={t("Models")}
      extra={
        <Button
          type="primary"
          icon={<Icon icon="plus" />}
          onClick={onModelModalOpen}
          disabled={!hasCreateRight}>
          {t("New Model")}
        </Button>
      }>
      <ContentSection>
        <ProjectHeader onModelSearch={onModelSearch} onModelSort={onModelSort} />
        {models?.length ? (
          <GridArea>
            {models.map(m => (
              <ModelCard
                key={m.id}
                model={m}
                hasUpdateRight={hasUpdateRight}
                hasDeleteRight={hasDeleteRight}
                hasSchemaCreateRight={hasSchemaCreateRight}
                hasContentCreateRight={hasContentCreateRight}
                exportLoading={exportLoading}
                onSchemaNavigate={onSchemaNavigate}
                onImportSchemaNavigate={onImportSchemaNavigate}
                onContentNavigate={onContentNavigate}
                onImportContentNavigate={onImportContentNavigate}
                onModelDeletionModalOpen={onModelDeletionModalOpen}
                onModelUpdateModalOpen={onModelUpdateModalOpen}
                onModelExport={onModelExport}
              />
            ))}
          </GridArea>
        ) : (
          <Placeholder>
            <Heading>{t("No Models yet")}</Heading>
            <Content>
              <Actions>
                {t("Create a new model")}
                <Button
                  type="primary"
                  icon={<Icon icon="plus" />}
                  onClick={onModelModalOpen}
                  disabled={!hasCreateRight}>
                  {t("New Model")}
                </Button>
              </Actions>
              <span>
                <Trans i18nKey="readDocument" components={{ l: <a href="" /> }} />
              </span>
            </Content>
          </Placeholder>
        )}
      </ContentSection>
    </InnerContent>
  );
};

export default ProjectOverview;

const GridArea = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  justify-content: space-between;
`;

const Placeholder = styled.div`
  padding: 64px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Heading = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const Actions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;
