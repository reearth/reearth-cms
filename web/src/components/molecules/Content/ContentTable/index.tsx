import { Link, useLocation } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { Item } from "@reearth-cms/components/molecules/Content/types";

const columns: ProColumns<Item & { location: any }>[] = [
  {
    title: "",
    dataIndex: "edit",
    render: (_, item) => {
      return (
        <Link to={item?.location?.pathname + "/details/" + item.id}>
          <Icon icon="edit" />
        </Link>
      );
    },
  },
  {
    title: "id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "💬",
    dataIndex: "notification",
    key: "notification",
    render: (_, item) => <Badge showZero={true} count={item.fields?.length} />,
  },
  {
    title: "Reversion",
    dataIndex: "reversion",
    key: "reversion",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "State",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "year",
    dataIndex: "year",
    key: "year",
  },
];

export interface Props {
  items: Item[];
}

const ContentTable: React.FC<Props> = ({ items }) => {
  const location = useLocation();

  const renderedItems: (Item & { location: any })[] = items.map(item => ({ ...item, location }));

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return (
    <ConfigProvider>
      <ProTable
        dataSource={renderedItems}
        columns={columns}
        search={false}
        rowKey="id"
        toolbar={handleToolbarEvents}
      />
    </ConfigProvider>
  );
};

export default ContentTable;
