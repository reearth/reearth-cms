import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import type { ColumnsType } from "antd/lib/table";

export const columns: ColumnsType<Asset> = [
  {
    title: "File",
    dataIndex: "file",
    key: "file",
  },
  {
    title: "Unzip File",
    dataIndex: "unzipFile",
    key: "unzipFile",
  },
  {
    title: "Mime Type",
    dataIndex: "contentType",
    key: "contentType",
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
  },
  {
    title: "Created By",
    dataIndex: "createdBy",
    key: "createdBy",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
  },
];
