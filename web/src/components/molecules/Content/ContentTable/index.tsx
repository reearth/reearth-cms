import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
};

const ContentTable: React.FC<Props> = ({ contentTableFields, contentTableColumns }) => {
  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return (
    <ProTable
      dataSource={contentTableFields}
      columns={contentTableColumns}
      search={false}
      rowKey="id"
      toolbar={handleToolbarEvents}
    />
  );
};

export default ContentTable;
