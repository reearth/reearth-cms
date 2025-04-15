import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tag from "@reearth-cms/components/atoms/Tag";
import { Trans, useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import { Field } from "./types";

type Props = {
  isMeta?: boolean;
  fields?: Field[];
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onFieldReorder: (data: Field[]) => Promise<void>;
  onFieldDelete: (fieldId: string) => Promise<void>;
  handleFieldUpdateModalOpen: (field: Field) => void;
};

const { confirm } = Modal;
const ModelFieldList: React.FC<Props> = ({
  fields,
  isMeta,
  hasUpdateRight,
  hasDeleteRight,
  onFieldReorder,
  onFieldDelete,
  handleFieldUpdateModalOpen,
}) => {
  const t = useT();

  const handleFieldDeleteConfirmation = useCallback(
    (fieldId: string, name: string) => {
      confirm({
        content: <Trans i18nKey="Are you sure you want to delete this field?" values={{ name }} />,
        icon: <Icon icon="exclamationCircle" />,
        cancelText: t("Cancel"),
        maskClosable: true,
        async onOk() {
          await onFieldDelete(fieldId);
        },
      });
    },
    [onFieldDelete, t],
  );

  const [data, setData] = useState(fields);

  useEffect(() => {
    setData(fields);
  }, [fields]);

  const reorder = useCallback(
    (list: Field[] | undefined, startIndex: number, endIndex: number) => {
      if (!list) return;
      let result = Array.from(list);
      if (isMeta) {
        result = result.map(field => ({ ...field, metadata: true }));
      }

      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      onFieldReorder(result);
      return result;
    },
    [isMeta, onFieldReorder],
  );

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0) return;
      return setData(reorder(data, fromIndex, toIndex));
    },
    [data, reorder],
  );

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
      {!isMeta && !fields?.length ? (
        <EmptyText>
          {t("Empty Schema design.")}
          <br />
          {t("Please add some field from right panel.")}
        </EmptyText>
      ) : (
        <ReactDragListView
          nodeSelector=".ant-list-item"
          handleSelector=".grabbable"
          lineClassName="dragLine"
          onDragEnd={onDragEnd}>
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
                    onClick={() => handleFieldDeleteConfirmation(item.id, item.title)}
                    icon={<Icon icon="delete" color="#8c8c8c" />}
                    disabled={!hasDeleteRight}
                  />,
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    onClick={() => handleFieldUpdateModalOpen(item)}
                    icon={<Icon icon="ellipsis" color="#8c8c8c" />}
                    disabled={!hasUpdateRight}
                  />,
                ]}>
                <List.Item.Meta
                  avatar={
                    <FieldThumbnail>
                      {hasUpdateRight && <DragIcon icon="menu" className="grabbable" />}
                      <StyledIcon
                        icon={fieldTypes[item.type].icon}
                        color={fieldTypes[item.type].color}
                      />
                    </FieldThumbnail>
                  }
                  title={
                    <ItemTitle>
                      <ItemTitleHeading>{item.title}</ItemTitleHeading>
                      {item.required ? " *" : ""}
                      <ItemKey>#{item.key}</ItemKey>
                      {item.unique ? <ItemUnique>({t("unique")})</ItemUnique> : ""}
                      {item.isTitle ? <ItemTitleTag>{t("Title")}</ItemTitleTag> : ""}
                    </ItemTitle>
                  }
                />
              </List.Item>
            ))}
          </FieldStyledList>
        </ReactDragListView>
      )}
    </>
  );
};

const DragIcon = styled(Icon)`
  margin-right: 16px;
  cursor: grab;
  :active {
    cursor: grabbing;
  }
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
  padding-top: 12px;
  .ant-list-empty-text {
    display: none;
  }
  .ant-list-item {
    background-color: #fff;
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

const EmptyText = styled.p`
  margin: 25vh auto 0;
  color: #898989;
  text-align: center;
`;

export default ModelFieldList;
