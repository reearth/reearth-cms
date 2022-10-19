import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { useT } from "@reearth-cms/i18n";

import ModelCard, { Model as ModelType } from "./ModelCard";

export type Model = ModelType;

export type Props = {
  projectName?: string;
  projectDescription?: string;
  models?: Model[];
  onModelModalOpen?: () => void;
  onSchemaNavigate?: (modelId: string) => void;
  onContentNavigate?: (modelId: string) => void;
};

const ProjectOverview: React.FC<Props> = ({
  projectName,
  projectDescription,
  models,
  onModelModalOpen,
  onSchemaNavigate,
  onContentNavigate,
}) => {
  const t = useT();

  return (
    <InnerContent title={projectName} subtitle={projectDescription}>
      <Wrapper>
        <Header>
          <Subtitle>{t("Models")}</Subtitle>
          <Button type="primary" icon={<Icon icon="plus" />} onClick={onModelModalOpen}>
            {t("New Model")}
          </Button>
        </Header>
        <GridArea>
          {models?.map(m => (
            <ModelCard
              key={m.id}
              model={m}
              onSchemaNavigate={onSchemaNavigate}
              onContentNavigate={onContentNavigate}
            />
          ))}
        </GridArea>
      </Wrapper>
    </InnerContent>
  );
};

export default ProjectOverview;

const Wrapper = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  align-items: center;
  padding-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const GridArea = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  justify-content: space-between;
  gap: 24px;
  margin-top: 24px;
`;
