import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal, { useModal } from "@reearth-cms/components/atoms/Modal";
import {
  ListToolBarProps,
  OptionConfig,
  StretchColumn,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { CorrespondingField } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { FormItem } from "../types";
import useHooks from "./hooks";

type Props = {
  correspondingField?: CorrespondingField;
  fieldId: string;
  itemGroupId?: string;
  linkedItem?: string;
  linkedItemsModalList?: FormItem[];
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  loading: boolean;
  onChange?: (value: string) => void;
  onCheckItemReference: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
  onLinkItemModalCancel: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemTableReload: () => void;
  onSearchTerm: (term?: string) => void;
  visible: boolean;
};

const LinkItemModal: React.FC<Props> = ({
  correspondingField,
  fieldId,
  itemGroupId,
  linkedItem,
  linkedItemsModalList,
  linkItemModalPage,
  linkItemModalPageSize,
  linkItemModalTitle,
  linkItemModalTotalCount,
  loading,
  onChange,
  onCheckItemReference,
  onLinkItemModalCancel,
  onLinkItemTableChange,
  onLinkItemTableReload,
  onSearchTerm,
  visible,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const { handleInput, pagination, value } = useHooks(
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
          content: t(
            "Are you going to refer to it? The previous reference will be canceled automatically",
          ),
          onOk() {
            handleChange(item.id);
          },
          title: t("This item has been referenced"),
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
        align: "center",
        fixed: "left",
        hideInSetting: true,
        minWidth: 48,
        render: (_, item) => {
          const isLink = item.id !== linkedItem;
          return (
            <Button
              icon={<Icon icon={isLink ? "arrowUpRight" : "arrowUpRightSlash"} size={18} />}
              onClick={() => handleClick(isLink, item)}
              type="link"
            />
          );
        },
        title: "",
        width: 48,
      },
      {
        dataIndex: "id",
        ellipsis: true,
        key: "id",
        minWidth: 210,
        title: "ID",
        width: 210,
      },
      {
        dataIndex: "title",
        ellipsis: true,
        key: "title",
        minWidth: 230,
        title: t("Title"),
        width: 230,
      },
      {
        dataIndex: "createdBy",
        ellipsis: true,
        key: "createdBy",
        minWidth: 100,
        title: t("Created By"),
        width: 100,
      },
      {
        dataIndex: "createdAt",
        ellipsis: true,
        key: "createdAt",
        minWidth: 130,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        title: t("Created At"),
        width: 130,
      },
    ],
    [t, linkedItem, handleClick],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          onChange={handleInput}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
          placeholder={t("input search text")}
          value={value}
        />
      ),
    }),
    [t, value, handleInput, onSearchTerm],
  );

  return (
    <StyledModal
      centered
      footer={null}
      onCancel={onLinkItemModalCancel}
      open={visible}
      styles={{
        body: {
          height: "70vh",
        },
      }}
      title={linkItemModalTitle}
      width="70vw">
      <ResizableProTable
        columns={columns}
        dataSource={linkedItemsModalList}
        heightOffset={0}
        loading={loading}
        onChange={pagination => {
          onLinkItemTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        options={options}
        pagination={pagination}
        search={false}
        toolbar={toolbar}
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
