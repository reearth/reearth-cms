import type { ParamsType } from "@ant-design/pro-provider";
import ProTable, { ListToolBarProps, ProTableProps } from "@ant-design/pro-table";
import { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import {
  ProColumnGroupType,
  TableRowSelection,
  ProColumnType,
} from "@ant-design/pro-table/lib/typing";
import { TablePaginationConfig, ConfigProvider } from "antd";
import enUSIntl from "antd/lib/locale/en_US";
import jaJPIntl from "antd/lib/locale/ja_JP";

import { useLang } from "@reearth-cms/i18n";

export type Props = ProTableProps<Record<string, any> | any, ParamsType, "text">;

type ProColumns<T = any, ValueType = "text"> =
  | ProColumnGroupType<T, ValueType>
  | ProColumnType<T, ValueType>;

const Table: React.FC<Props> = props => {
  const lang = useLang();

  return (
    <ConfigProvider locale={lang === "ja" ? jaJPIntl : enUSIntl}>
      <ProTable {...props} />;
    </ConfigProvider>
  );
};

export default Table;
export type {
  ProTableProps,
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
};
