import type { ParamsType } from "@ant-design/pro-provider";
import ProTable, { ListToolBarProps, ProTableProps, ColumnsState } from "@ant-design/pro-table";
import { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import { ProColumns, TableRowSelection } from "@ant-design/pro-table/lib/typing";
import { ConfigProvider } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import jaJPIntl from "antd/lib/locale/ja_JP";

import { useLang } from "@reearth-cms/i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Props = ProTableProps<Record<string, any> | any, ParamsType, "text">;

const Table: React.FC<Props> = props => {
  const lang = useLang();

  return (
    <ConfigProvider locale={lang === "ja" ? jaJPIntl : enUSIntl}>
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
