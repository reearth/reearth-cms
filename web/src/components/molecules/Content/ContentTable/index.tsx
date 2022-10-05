import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";

import { Item } from "../types";

const columns: ProColumns<any>[] = [];

export type Props = {
  items?: Item[];
};

const ContentTable: React.FC<Props> = ({ items }) => {
  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return (
    <ProTable
      dataSource={items}
      columns={columns}
      search={false}
      rowKey="id"
      toolbar={handleToolbarEvents}
    />
  );
};

export default ContentTable;
