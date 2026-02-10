import {
  ProTable,
  ListToolBarProps,
  ProTableProps,
  ColumnsState,
  ProColumns,
} from "@ant-design/pro-components";
import type { ParamsType } from "@ant-design/pro-components";
import { ConfigProvider, Empty, GetProp, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import enUSIntl from "antd/locale/en_US";
import jaJPIntl from "antd/locale/ja_JP";

import { useLang, useT } from "@reearth-cms/i18n";

type OptionConfig = {
  reload?: (() => void) | boolean;
  density?: boolean;
  search?: boolean;
  setting?: boolean;
  fullScreen?: (() => void) | boolean;
};

type TableRowSelection<T extends AnyObject = AnyObject> = TableProps<T>["rowSelection"];

export type Props = ProTableProps<Record<string, unknown>, ParamsType, "text">;

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
