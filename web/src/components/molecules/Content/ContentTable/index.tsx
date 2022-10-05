import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";

const columns: ProColumns<any>[] = [];

const ContentTable: React.FC = () => {
  const dataSource: [] = [];

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return (
    <ProTable
      dataSource={dataSource}
      columns={columns}
      search={false}
      rowKey="id"
      toolbar={handleToolbarEvents}
    />
  );
};

export default ContentTable;
