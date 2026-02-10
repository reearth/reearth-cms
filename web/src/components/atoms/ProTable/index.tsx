import {
  ProTable,
  ListToolBarProps,
  ProTableProps,
  ColumnsState,
  ProColumns,
} from "@ant-design/pro-components";
import type { ParamsType } from "@ant-design/pro-components";
import { forwardRef } from "react";
import { TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";

type OptionConfig = {
  reload?: (() => void) | boolean;
  density?: boolean;
  search?: boolean;
  setting?: boolean;
  fullScreen?: (() => void) | boolean;
};

type TableRowSelection<T extends AnyObject = AnyObject> = TableProps<T>["rowSelection"];

export type Props = ProTableProps<Record<string, unknown>, ParamsType, "text">;

const Table = forwardRef<HTMLDivElement, Props>((props, _ref) => {
  return <ProTable {...props} />;
});

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
