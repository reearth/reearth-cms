import styled from "@emotion/styled";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";

export type Model = {
  id: string;
  name: string;
  description?: string;
};

export type Props = {
  model: Model;
  onSchemaNavigate?: (modelId: string) => void;
  onContentNavigate?: (modelId: string) => void;
};

const ModelCard: React.FC<Props> = ({ model, onSchemaNavigate, onContentNavigate }) => {
  const { Meta } = Card;

  return (
    <StyledCard
      actions={[
        <Icon icon="unorderedList" key="schema" onClick={() => onSchemaNavigate?.(model.id)} />,
        <Icon icon="table" key="content" onClick={() => onContentNavigate?.(model.id)} />,
      ]}>
      <Meta title={model.name} description={model.description} />
    </StyledCard>
  );
};

export default ModelCard;

const StyledCard = styled(Card)`
  .ant-card-body {
    height: 102px;
  }
  .ant-card-meta-description {
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;
