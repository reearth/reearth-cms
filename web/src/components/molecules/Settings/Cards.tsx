import styled from "@emotion/styled";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Resource } from "@reearth-cms/components/molecules/Workspace/types";

export type Props = {
  resources: Resource[];
  onModalOpen: () => void;
};

const Cards: React.FC<Props> = ({ resources, onModalOpen }) => {
  const { Meta } = Card;

  return (
    <GridArea>
      {resources?.map(resource => {
        return (
          <StyledCard
            actions={[
              <Icon icon="delete" key="delete" onClick={() => console.log("delete")} />,
              <Icon icon="edit" key="edit" onClick={onModalOpen} />,
            ]}
            key={resource.id}>
            <Meta title={resource.props?.name ? resource.props.name : resource.type} />
          </StyledCard>
        );
      })}
    </GridArea>
  );
};

export default Cards;

const GridArea = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  padding-bottom: 12px;
`;

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 16px;
  }
`;
