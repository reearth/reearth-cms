import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { Trans, useT } from "@reearth-cms/i18n";

import { SortBy, UpdateProjectInput } from "../Workspace/types";
import ModelCard from "./ModelCard";
import ProjectHeader from "./ProjectHeader";

type Props = {
  exportLoading?: boolean;
  hasContentCreateRight: boolean;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasSchemaCreateRight: boolean;
  hasUpdateRight: boolean;
  models?: Model[];
  onContentNavigate: (modelId: string) => void;
  onHomeNavigation: () => void;
  onImportContentNavigate: (modelId: string) => void;
  onImportSchemaNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelExport: (modelId?: string, format?: ExportFormat) => Promise<void>;
  onModelModalOpen: () => void;
  onModelSearch: (value: string) => void;
  onModelSort: (sort: SortBy) => void;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onSchemaNavigate: (modelId: string) => void;
};

const ProjectOverview: React.FC<Props> = ({
  exportLoading,
  hasContentCreateRight,
  hasCreateRight,
  hasDeleteRight,
  hasSchemaCreateRight,
  hasUpdateRight,
  models,
  onContentNavigate,
  onImportContentNavigate,
  onImportSchemaNavigate,
  onModelDeletionModalOpen,
  onModelExport,
  onModelModalOpen,
  onModelSearch,
  onModelSort,
  onModelUpdateModalOpen,
  onSchemaNavigate,
}) => {
  const t = useT();

  return (
    <InnerContent
      extra={
        <Button
          disabled={!hasCreateRight}
          icon={<Icon icon="plus" />}
          onClick={onModelModalOpen}
          type="primary">
          {t("New Model")}
        </Button>
      }
      title={t("Models")}>
      <ContentSection>
        <ProjectHeader onModelSearch={onModelSearch} onModelSort={onModelSort} />
        {models?.length ? (
          <GridArea>
            {models.map(m => (
              <ModelCard
                exportLoading={exportLoading}
                hasContentCreateRight={hasContentCreateRight}
                hasDeleteRight={hasDeleteRight}
                hasSchemaCreateRight={hasSchemaCreateRight}
                hasUpdateRight={hasUpdateRight}
                key={m.id}
                model={m}
                onContentNavigate={onContentNavigate}
                onImportContentNavigate={onImportContentNavigate}
                onImportSchemaNavigate={onImportSchemaNavigate}
                onModelDeletionModalOpen={onModelDeletionModalOpen}
                onModelExport={onModelExport}
                onModelUpdateModalOpen={onModelUpdateModalOpen}
                onSchemaNavigate={onSchemaNavigate}
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
                  disabled={!hasCreateRight}
                  icon={<Icon icon="plus" />}
                  onClick={onModelModalOpen}
                  type="primary">
                  {t("New Model")}
                </Button>
              </Actions>
              <span>
                <Trans components={{ l: <a href="" /> }} i18nKey="readDocument" />
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
