import styled from "@emotion/styled";
import { forwardRef, ReactNode } from "react";

type ListProps<T = unknown> = {
  className?: string;
  style?: React.CSSProperties;
  itemLayout?: "horizontal" | "vertical";
  dataSource?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  children?: ReactNode;
};

type ListItemProps = {
  className?: string;
  style?: React.CSSProperties;
  actions?: ReactNode[];
  onClick?: () => void;
  children?: ReactNode;
};

type ListItemMetaProps = {
  className?: string;
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

const ListItemMeta = forwardRef<HTMLDivElement, ListItemMetaProps>(
  ({ className, avatar, title, description }, ref) => (
    <div ref={ref} className={`ant-list-item-meta ${className ?? ""}`}>
      {avatar && <div className="ant-list-item-meta-avatar">{avatar}</div>}
      <div className="ant-list-item-meta-content">
        {title && <h4 className="ant-list-item-meta-title">{title}</h4>}
        {description && <div className="ant-list-item-meta-description">{description}</div>}
      </div>
    </div>
  ),
);

const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  ({ className, actions, onClick, children, ...rest }, ref) => (
    <div ref={ref} className={`ant-list-item ${className ?? ""}`} onClick={onClick} {...rest}>
      {children}
      {actions && actions.length > 0 && (
        <ul className="ant-list-item-action">
          {actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      )}
    </div>
  ),
);

function ListInner<T>(
  { className, dataSource, renderItem, children, ...rest }: ListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <ListContainer ref={ref} className={`ant-list ${className ?? ""}`} {...rest}>
      {dataSource && renderItem
        ? dataSource.map((item, index) => renderItem(item, index))
        : children}
    </ListContainer>
  );
}

const ListContainer = styled.div`
  .ant-list-item {
    display: flex;
    align-items: center;
  }
  .ant-list-item-meta {
    display: flex;
    flex: 1;
    align-items: flex-start;
    gap: 8px;
  }
  .ant-list-item-meta-content {
    flex: 1;
    min-width: 0;
  }
  .ant-list-item-meta-title {
    margin: 0;
    font-size: 14px;
    font-weight: normal;
    line-height: 22px;
  }
  .ant-list-item-meta-description {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    line-height: 22px;
  }
  .ant-list-item-action {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 4px;
    li {
      display: inline-flex;
    }
  }
`;

const List = forwardRef(ListInner) as <T>(
  props: ListProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof ListInner>;

type ListComponent = typeof List & {
  Item: typeof ListItem & { Meta: typeof ListItemMeta };
};

const ListWithSub = List as ListComponent;
ListWithSub.Item = ListItem as typeof ListItem & { Meta: typeof ListItemMeta };
ListWithSub.Item.Meta = ListItemMeta;

export default ListWithSub;
