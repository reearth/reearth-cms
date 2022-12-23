import styled from "@emotion/styled";
import { useCallback } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import { Field } from "./types";

export interface Props {
  className?: string;
  fields?: Field[];
  onFieldDelete: (fieldId: string) => Promise<void>;
  handleFieldUpdateModalOpen: (field: Field) => void;
}

const ModelFieldList: React.FC<Props> = ({
  className,
  fields,
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
        onOk() {
          onFieldDelete(fieldId);
        },
      });
    },
    [confirm, onFieldDelete, t],
  );

  return (
    <FieldStyledList
      className={className}
      itemLayout="horizontal"
      dataSource={fields}
      renderItem={item => (
        <List.Item
          actions={[
            <Icon
              icon="delete"
              onClick={() => handleFieldDeleteConfirmation((item as Field).id)}
              key="delete"
            />,
            <Icon
              icon="ellipsis"
              onClick={() => handleFieldUpdateModalOpen(item as Field)}
              key="edit"
            />,
          ]}>
          <List.Item.Meta
            avatar={
              <FieldThumbnail>
                <StyledIcon
                  icon={fieldTypes[(item as Field).type].icon}
                  color={fieldTypes[(item as Field).type].color}
                />
                <h3>{(item as Field).type}</h3>
              </FieldThumbnail>
            }
            title={
              <ItemTitle>
                {(item as Field).title} {(item as Field).required ? " *" : ""}
                <ItemKey>#{(item as Field).key}</ItemKey>
                {(item as Field).unique ? <ItemUnique>({t("unique")})</ItemUnique> : ""}
              </ItemTitle>
            }
          />
        </List.Item>
      )}
    />
  );
};

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
      .ant-list-item-meta-avatar {
        min-width: 130px;
      }
    }
  }
`;

const ItemTitle = styled.p`
  color: rgba(0, 0, 0, 0.85);
  margin: 0;
`;

const ItemKey = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

const ItemUnique = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

export default ModelFieldList;
