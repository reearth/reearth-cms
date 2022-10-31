import { useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { ProColumns, ListToolBarProps } from "@reearth-cms/components/atoms/ProTable";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  loading: boolean;
  onItemEdit: (itemId: string) => void;
  onItemsReload: () => void;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  onItemEdit,
  onItemsReload,
}) => {
  const actionsColumn: ProColumns<ContentTableField> = useMemo(
    () => ({
      render: (_, contentField) => (
        <Button
          type="link"
          icon={<Icon icon="edit" />}
          onClick={() => onItemEdit(contentField.id)}
        />
      ),
      width: 48,
      minWidth: 48,
    }),
    [onItemEdit],
  );

  const options = {
    fullScreen: true,
    reload: onItemsReload,
    setting: true,
  };

  return contentTableColumns ? (
    <ResizableProTable
      options={options}
      loading={loading}
      dataSource={contentTableFields}
      proColumns={[actionsColumn, ...contentTableColumns]}
    />
  ) : null;
};

export default ContentTable;
