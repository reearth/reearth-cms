import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import { Project, SortBy, UpdateProjectInput } from "../Workspace/types";

import ModelsTab from "./ModelsTab";

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

const ProjectOverview: React.FC<Props> = ({
  project,
  models,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  onModelSearch,
  onModelSort,
  onModelModalOpen,
  onSchemaNavigate,
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
}) => {
  const t = useT();

  return (
    <InnerContent title={project?.name} subtitle={project?.description} flexChildren>
      <ContentSection
        title={t("Models")}
        headerActions={
          <Button
            type="primary"
            icon={<Icon icon="plus" />}
            onClick={onModelModalOpen}
            disabled={!hasCreateRight}>
            {t("New Model")}
          </Button>
        }>
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
      </ContentSection>
    </InnerContent>
  );
};

export default ProjectOverview;
