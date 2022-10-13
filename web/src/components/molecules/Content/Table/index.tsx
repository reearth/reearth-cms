import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  onItemEdit: (itemId: string) => void;
};

const ContentTable: React.FC<Props> = ({ contentTableFields, contentTableColumns, onItemEdit }) => {
  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return contentTableColumns ? (
    <ProTable
      dataSource={contentTableFields}
      columns={[
        {
          title: "actions",
          render: (_, contentField) => (
            <Icon icon="edit" onClick={() => onItemEdit(contentField.id)} />
          ),
        },
        ...contentTableColumns,
      ]}
      search={false}
      rowKey="id"
      toolbar={handleToolbarEvents}
    />
  ) : null;
};

export default ContentTable;
