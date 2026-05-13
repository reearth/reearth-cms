import type { ParamsType } from "@ant-design/pro-provider";
import ProTable, { ListToolBarProps, ProTableProps, ColumnsState } from "@ant-design/pro-table";
import { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import { ProColumns, TableRowSelection } from "@ant-design/pro-table/lib/typing";
import { ConfigProvider, Empty, GetProp } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import jaJPIntl from "antd/lib/locale/ja_JP";

import { useLang, useT } from "@reearth-cms/i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props = ProTableProps<Record<string, any> | any, ParamsType, "text">;

const Table: React.FC<Props> = props => {
  const lang = useLang();
  const t = useT();

  const renderEmpty: GetProp<typeof ConfigProvider, "renderEmpty"> = _componentName => {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("No data")} />;
  };

  return (
    <ConfigProvider locale={lang === "ja" ? jaJPIntl : enUSIntl} renderEmpty={renderEmpty}>
      <ProTable {...props} />
    </ConfigProvider>
  );
};

export type StretchColumn<T> = ProColumns<T> & { minWidth: number };

export default Table;
export type {
  ProTableProps,
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  ParamsType,
  ColumnsState,
};
