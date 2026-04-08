import { Table, TableColumnsType, TableProps } from "antd";
import type { SorterResult } from "antd/es/table/interface";

type TablePaginationConfig = Exclude<TableProps["pagination"], false | undefined>;

export type { TableColumnsType, SorterResult, TablePaginationConfig };

export default Table;
