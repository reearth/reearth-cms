import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  StretchColumn,
  ListToolBarProps,
  OptionConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { CorrespondingField } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { FormItem } from "../types";

import useHooks from "./hooks";

type Props = {
  visible: boolean;
  loading: boolean;
  fieldId: string;
  itemGroupId?: string;
  correspondingField?: CorrespondingField;
  linkedItemsModalList?: FormItem[];
  linkedItem?: string;
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemModalCancel: () => void;
  onChange?: (value: string) => void;
  onCheckItemReference: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
};

const LinkItemModal: React.FC<Props> = ({
  visible,
  loading,
  fieldId,
  itemGroupId,
  correspondingField,
  linkedItemsModalList,
  linkedItem,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onSearchTerm,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onLinkItemModalCancel,
  onChange,
  onCheckItemReference,
}) => {
  const t = useT();
  const { confirm } = Modal;
  const { value, pagination, handleInput } = useHooks(
    linkItemModalTotalCount,
    linkItemModalPage,
    linkItemModalPageSize,
    visible,
  );

  const options: OptionConfig = useMemo(
    () => ({
      reload: onLinkItemTableReload,
    }),
    [onLinkItemTableReload],
  );

  const handleChange = useCallback(
    (value: string) => {
      onChange?.(value);
      onLinkItemModalCancel();
    },
    [onChange, onLinkItemModalCancel],
  );

  const handleClick = useCallback(
    async (link: boolean, item: FormItem) => {
      if (!link) {
        handleChange("");
        return;
      }

      if (!correspondingField) {
        handleChange(item.id);
        return;
      }

      const isReferenced = await onCheckItemReference(item.id, fieldId, itemGroupId);
      if (isReferenced) {
        confirm({
          title: t("This item has been referenced"),
          content: t(
            "Are you going to refer to it? The previous reference will be canceled automatically",
          ),
          icon: <Icon icon="exclamationCircle" />,
          onOk() {
            handleChange(item.id);
          },
        });
      } else {
        handleChange(item.id);
      }
    },
    [confirm, correspondingField, fieldId, handleChange, itemGroupId, onCheckItemReference, t],
  );

  const columns: StretchColumn<FormItem>[] = useMemo(
    () => [
      {
        title: "",
        hideInSetting: true,
        fixed: "left",
        align: "center",
        width: 48,
        minWidth: 48,
        render: (_, item) => {
          const isLink = item.id !== linkedItem;
          return (
            <Button
              type="link"
              icon={<Icon icon={isLink ? "arrowUpRight" : "arrowUpRightSlash"} size={18} />}
              onClick={() => handleClick(isLink, item)}
            />
          );
        },
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        ellipsis: true,
        width: 210,
        minWidth: 210,
      },
      {
        title: t("Title"),
        dataIndex: "title",
        key: "title",
        ellipsis: true,
        width: 230,
        minWidth: 230,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy} size="small" />
            {item.createdBy}
          </Space>
        ),
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_text, record) => dateTimeFormat(record.createdAt),
      },
    ],
    [t, linkedItem, handleClick],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          placeholder={t("input search text")}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
          value={value}
          onChange={handleInput}
        />
      ),
    }),
    [t, value, handleInput, onSearchTerm],
  );

  return (
    <StyledModal
      open={visible}
      title={linkItemModalTitle}
      centered
      width="70vw"
      footer={null}
      onCancel={onLinkItemModalCancel}
      styles={{
        body: {
          height: "70vh",
        },
      }}>
      <ResizableProTable
        dataSource={linkedItemsModalList}
        columns={columns}
        search={false}
        options={options}
        toolbar={toolbar}
        pagination={pagination}
        loading={loading}
        onChange={pagination => {
          onLinkItemTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        heightOffset={0}
      />
    </StyledModal>
  );
};

export default LinkItemModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
