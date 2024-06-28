import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import { Field } from "./types";

interface Props {
  isMeta?: boolean;
  fields?: Field[];
  onFieldReorder: (data: Field[]) => Promise<void>;
  onFieldDelete: (fieldId: string) => Promise<void>;
  handleFieldUpdateModalOpen: (field: Field) => void;
}

const ModelFieldList: React.FC<Props> = ({
  fields,
  isMeta,
  onFieldReorder,
  onFieldDelete,
  handleFieldUpdateModalOpen,
}) => {
  const t = useT();
  const { confirm } = Modal;

  const handleFieldDeleteConfirmation = useCallback(
    (fieldId: string) => {
      confirm({
        title: t("Are you sure you want to delete this field?"),
        icon: <Icon icon="exclamationCircle" />,
        cancelText: t("Cancel"),
        maskClosable: true,
        async onOk() {
          await onFieldDelete(fieldId);
        },
      });
    },
    [confirm, onFieldDelete, t],
  );

  const [data, setData] = useState(fields);

  useEffect(() => {
    setData(fields);
  }, [fields]);

  const reorder = (list: Field[] | undefined, startIndex: number, endIndex: number) => {
    if (!list) return;
    let result = Array.from(list);
    if (isMeta) {
      result = result.map(field => ({ ...field, metadata: true }));
    }

    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    onFieldReorder(result);
    return result;
  };

  const onDragEnd = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0) return;
    return setData(reorder(data, fromIndex, toIndex));
  };

  return (
    <>
      {isMeta && (
        <FieldStyledList itemLayout="horizontal">
          <List.Item key="entryInformation" actions={[null]}>
            <List.Item.Meta
              avatar={
                <FieldThumbnail>
                  <StyledIcon icon="terminalWindow" color="#40A9FF" />
                </FieldThumbnail>
              }
              title={<ItemTitle>{t("Item Information")}</ItemTitle>}
            />
          </List.Item>
          <List.Item key="publishStatus" actions={[null]}>
            <List.Item.Meta
              avatar={
                <FieldThumbnail>
                  <StyledIcon icon="LineSegments" color="#FF9C6E" />
                </FieldThumbnail>
              }
              title={<ItemTitle>{t("Publish Status")}</ItemTitle>}
            />
          </List.Item>
        </FieldStyledList>
      )}
      <ReactDragListView
        nodeSelector=".ant-list-item"
        lineClassName="dragLine"
        onDragEnd={(fromIndex, toIndex) => onDragEnd(fromIndex, toIndex)}>
        <FieldStyledList itemLayout="horizontal">
          {data?.map((item, index) => (
            <List.Item
              className="draggable-item"
              key={index}
              actions={[
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  onClick={() => handleFieldDeleteConfirmation(item.id)}
                  icon={<Icon icon="delete" color="#8c8c8c" />}
                />,
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  onClick={() => handleFieldUpdateModalOpen(item)}
                  icon={<Icon icon="ellipsis" color="#8c8c8c" />}
                />,
              ]}>
              <List.Item.Meta
                avatar={
                  <FieldThumbnail>
                    <DragIcon icon="menu" className="grabbable" />
                    <StyledIcon
                      icon={fieldTypes[(item as Field).type].icon}
                      color={fieldTypes[(item as Field).type].color}
                    />
                  </FieldThumbnail>
                }
                title={
                  <ItemTitle>
                    <ItemTitleHeading>{(item as Field).title}</ItemTitleHeading>
                    {(item as Field).required ? " *" : ""}
                    <ItemKey>#{(item as Field).key}</ItemKey>
                    {(item as Field).unique ? <ItemUnique>({t("unique")})</ItemUnique> : ""}
                    {(item as Field).isTitle ? <ItemTitleTag>{t("Title")}</ItemTitleTag> : ""}
                  </ItemTitle>
                }
              />
            </List.Item>
          ))}
        </FieldStyledList>
      </ReactDragListView>
    </>
  );
};

const DragIcon = styled(Icon)`
  margin-right: 16px;
  cursor: grab;
`;

const StyledIcon = styled(Icon)`
  border: 1px solid #f0f0f0;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    margin-left: 12px;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.45);
  }
`;

const FieldStyledList = styled(List)`
  padding-top: 24px;
  .ant-list-empty-text {
    display: none;
  }
  .ant-list-item {
    background-color: #fff;
    cursor: pointer;
    + .ant-list-item {
      margin-top: 12px;
    }
    padding: 24px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    .ant-list-item-meta {
      .ant-list-item-meta-content {
        text-align: center;
        margin: auto;
      }
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
    }
    .ant-list-item-action > li {
      padding: 0 3px;
    }
  }

  .grabbable {
    cursor: grab;
  }
`;

const ItemTitle = styled.p`
  color: rgba(0, 0, 0, 0.85);
  margin: 0;
  display: flex;
  justify-content: center;
`;

const ItemTitleHeading = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const ItemKey = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const ItemUnique = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

const ItemTitleTag = styled(Tag)`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  background-color: #fafafa;
`;

export default ModelFieldList;
