import styled from "@emotion/styled";
import ReactDragListView from "react-drag-listview";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Resource } from "@reearth-cms/components/molecules/Workspace/types";
import { Constant } from "@reearth-cms/utils/constant";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

export type Props = {
  resources: Resource[];
  onModalOpen: (index: number) => void;
  isTile: boolean;
  onDelete: (isTile: boolean, index: number) => void;
  onDragEnd: (fromIndex: number, toIndex: number, isTile: boolean) => void;
  hasUpdateRight: boolean;
};

const { DragColumn } = ReactDragListView;
const { Meta } = Card;

const Cards: React.FC<Props> = ({
  resources,
  onModalOpen,
  isTile,
  onDelete,
  onDragEnd,
  hasUpdateRight,
}) => {
  return (
    <DragColumn
      nodeSelector=".ant-card"
      handleSelector=".grabbable"
      lineClassName="dragLineColumn"
      onDragEnd={(fromIndex, toIndex) => onDragEnd(fromIndex, toIndex, isTile)}>
      <GridArea>
        {resources.map((resource, index) => {
          return (
            <StyledCard
              actions={[
                <Icon
                  icon="delete"
                  key="delete"
                  onClick={hasUpdateRight ? () => onDelete(isTile, index) : undefined}
                />,
                <Icon
                  icon="edit"
                  key="edit"
                  onClick={hasUpdateRight ? () => onModalOpen(index) : undefined}
                />,
              ]}
              key={resource.id}
              $hasUpdateRight={hasUpdateRight}>
              <TitleWrapper>
                <StyledMeta
                  avatar={resource.props?.image ? <img src={resource.props?.image} /> : null}
                  title={resource.props?.name ? resource.props.name : resource.type}
                />
                {hasUpdateRight && <DragIcon icon="menu" className="grabbable" />}
              </TitleWrapper>
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
  gap: ${AntdToken.SPACING.SM}px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  padding-bottom: ${AntdToken.SPACING.SM}px;
`;

const StyledCard = styled(Card, Constant.TRANSIENT_OPTIONS)<{ $hasUpdateRight: boolean }>`
  .ant-card-actions > li > span {
    ${({ $hasUpdateRight }) => !$hasUpdateRight && "cursor: not-allowed;"}
    > .anticon {
      ${({ $hasUpdateRight }) =>
        !$hasUpdateRight && `cursor: not-allowed; color: ${AntdColor.NEUTRAL.TEXT_QUATERNARY};`}
      :hover {
        ${({ $hasUpdateRight }) =>
          !$hasUpdateRight && `color: ${AntdColor.NEUTRAL.TEXT_QUATERNARY};`}
      }
    }
  }
  .ant-card-body {
    padding: ${AntdToken.SPACING.BASE}px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledMeta = styled(Meta)`
  overflow: hidden;
  .ant-card-meta-avatar {
    padding-right: ${AntdToken.SPACING.XS}px;
    img {
      width: ${AntdToken.SPACING.MD}px;
      height: ${AntdToken.SPACING.MD}px;
      object-fit: cover;
    }
  }
`;

const DragIcon = styled(Icon)`
  cursor: grab;
  :active {
    cursor: grabbing;
  }
`;
