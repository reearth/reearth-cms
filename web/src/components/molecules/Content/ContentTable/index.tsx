import styled from "@emotion/styled";
import { Link, useLocation } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { Item } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";

const columns: ProColumns<Item & { location: any }>[] = [
  {
    title: "",
    dataIndex: "edit",
    render: (_, item) => {
      return (
        <Link to={item?.location?.pathname + "/details"}>
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
  handleAdd: () => void;
}

const ContentTable: React.FC<Props> = ({ handleAdd, items }) => {
  const t = useT();
  const location = useLocation();

  const renderedItems: (Item & { location: any })[] = items.map(item => ({ ...item, location }));

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  return (
    <ConfigProvider
      renderEmpty={() => (
        <EmptyTableWrapper>
          <Title>{t("No Items yet")}</Title>
          <Suggestion>
            {t("Create a new")}{" "}
            <Button onClick={handleAdd} type="primary">
              {t("New Item")}
            </Button>
          </Suggestion>
          <Suggestion>
            {t("Or read")} <a href="">{t("how to use Re:Earth CMS")}</a> {t("first")}
          </Suggestion>
        </EmptyTableWrapper>
      )}>
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

const EmptyTableWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const Suggestion = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
`;

export default ContentTable;
