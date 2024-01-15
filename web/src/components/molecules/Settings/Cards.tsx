import styled from "@emotion/styled";
import ReactDragListView from "react-drag-listview";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Resource } from "@reearth-cms/components/molecules/Workspace/types";

export type Props = {
  resources: Resource[];
  onModalOpen: (index: number) => void;
  isTile: boolean;
  onDelete: (isTile: boolean, index: number) => void;
  onDragEnd: (fromIndex: number, toIndex: number, isTile: boolean) => void;
};

const { DragColumn } = ReactDragListView;

const Cards: React.FC<Props> = ({ resources, onModalOpen, isTile, onDelete, onDragEnd }) => {
  const { Meta } = Card;

  return (
    <DragColumn
      nodeSelector=".ant-card"
      lineClassName="dragLineColumn"
      onDragEnd={(fromIndex, toIndex) => onDragEnd(fromIndex, toIndex, isTile)}>
      <GridArea>
        {resources.map((resource, index) => {
          return (
            <StyledCard
              actions={[
                <Icon icon="delete" key="delete" onClick={() => onDelete(isTile, index)} />,
                <Icon icon="edit" key="edit" onClick={() => onModalOpen(index)} />,
              ]}
              key={resource.id}>
              <Meta title={resource.props?.name ? resource.props.name : resource.type} />
            </StyledCard>
          );
        })}
      </GridArea>
    </DragColumn>
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
