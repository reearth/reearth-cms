import type { ParamsType } from "@ant-design/pro-provider";
import ProTable, { ListToolBarProps, ProTableProps, ProColumns } from "@ant-design/pro-table";
import { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import { TableRowSelection } from "@ant-design/pro-table/lib/typing";
import { TablePaginationConfig, ConfigProvider } from "antd";
import { Locale } from "antd/lib/locale-provider";
import enUSIntl from "antd/lib/locale/en_US";
import jaJPIntl from "antd/lib/locale/ja_JP";
import { useEffect, useState } from "react";

import { useLang } from "@reearth-cms/i18n";

export type Props = ProTableProps<Record<string, any>, ParamsType, "text">;

const Table: React.FC<Props> = props => {
  const [antdLang, setAntdLang] = useState<Locale>(enUSIntl);
  const lang = useLang();
  console.log(lang);

  useEffect(() => {
    setAntdLang(lang === "ja" ? jaJPIntl : enUSIntl);
  }, [lang]);

  return (
    <ConfigProvider locale={antdLang}>
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
