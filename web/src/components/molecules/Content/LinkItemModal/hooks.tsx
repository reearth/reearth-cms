import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  TablePaginationConfig,
  ProColumns,
  ListToolBarProps,
} from "@reearth-cms/components/atoms/ProTable";
import { useIsItemReferencedLazyQuery } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { FormItem } from "../types";

export default (
  correspondingFieldId: string,
  onSearchTerm: (term?: string) => void,
  onLinkItemModalCancel: () => void,
  onChange?: (value: string) => void,
  linkItemModalTotalCount?: number,
  linkItemModalPage?: number,
  linkItemModalPageSize?: number,
  linkedItem?: string,
  visible?: boolean,
) => {
  const t = useT();
  const { confirm } = Modal;
  const [value, setValue] = useState("");
  const [hoveredAssetId, setHoveredItemId] = useState<string>();

  const [checkIfItemIsReferenced, { data }] = useIsItemReferencedLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleCheckItemReference = useCallback(
    async (value: string, correspondingFieldId: string) =>
      await checkIfItemIsReferenced({ variables: { itemId: value ?? "", correspondingFieldId } }),
    [checkIfItemIsReferenced],
  );

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      current: linkItemModalPage,
      total: linkItemModalTotalCount,
      pageSize: linkItemModalPageSize,
    }),
    [linkItemModalPage, linkItemModalTotalCount, linkItemModalPageSize],
  );

  const handleClick = useCallback(
    async (link: boolean, item: FormItem) => {
      if (!link) {
        onChange?.("");
        onLinkItemModalCancel();
        return;
      }

      const response = await handleCheckItemReference(item.id, correspondingFieldId);
      const isReferenced = response?.data?.isItemReferenced;

      if (isReferenced) {
        confirm({
          title: t("This item has been referenced"),
          content: t(
            "Are you going to refer to it? The previous reference will be canceled automatically",
          ),
          icon: <Icon icon="exclamationCircle" />,
          onOk() {
            onChange?.(item.id);
            onLinkItemModalCancel();
          },
        });
      } else {
        onChange?.(item.id);
        onLinkItemModalCancel();
      }
    },
    [confirm, correspondingFieldId, handleCheckItemReference, onChange, onLinkItemModalCancel, t],
  );

  const columns: ProColumns<FormItem>[] = useMemo(
    () => [
      {
        title: "",
        width: 40,
        render: (_, item) => {
          const link =
            (item.id === linkedItem && hoveredAssetId !== item.id) ||
            (item.id !== linkedItem && hoveredAssetId === item.id);
          return (
            <Button
              type="link"
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(undefined)}
              icon={<Icon icon={link ? "linkSolid" : "unlinkSolid"} size={16} />}
              onClick={() => handleClick(link, item)}
            />
          );
        },
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        ellipsis: true,
      },
      {
        title: t("Title"),
        dataIndex: "title",
        key: "title",
        ellipsis: true,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        key: "createdBy",
        ellipsis: true,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        ellipsis: true,
        render: (_text, record) => dateTimeFormat(record.createdAt),
      },
    ],
    [t, linkedItem, hoveredAssetId, handleClick],
  );

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Input.Search
          allowClear
          placeholder={t("input search text")}
          onSearch={(value: string) => {
            if (value) {
              onSearchTerm(value);
            } else {
              onSearchTerm();
            }
          }}
          value={value}
          onChange={handleInput}
        />
      ),
    }),
    [t, value, handleInput, onSearchTerm],
  );

  useEffect(() => {
    if (!visible) {
      setValue("");
    }
  }, [visible]);

  return {
    isReferenced: data?.isItemReferenced,
    value,
    columns,
    toolbar,
    pagination,
    handleInput,
    handleClick,
    handleCheckItemReference,
  };
};
